import { NextResponse, type NextRequest } from "next/server";
import { lookup } from "dns/promises";
import { isAdmin } from "@/lib/admin-auth";
import type { Badge } from "@/lib/catalog-types";
import { CATEGORIES, type CategorySlug } from "@/lib/site";

/**
 * Generate a full product draft from a retailer URL: fetch the product page,
 * extract title/image/price/description (OpenGraph + JSON-LD), then have Claude
 * write the bilingual luxury copy. The pasted URL becomes the affiliate link.
 * Admin-guarded.
 */

const CATS = CATEGORIES.map((c) => c.slug) as string[];
const BADGES: Badge[] = ["best-pick", "luxury-deal", "editor-choice"];

const CAT_KEYWORDS: Record<CategorySlug, string[]> = {
  perfumes: ["perfume", "parfum", "fragrance", "cologne", "eau de", "عطر", "برفان"],
  watches: ["watch", "chronograph", "automatic", "wrist", "ساعة"],
  sunglasses: ["sunglass", "eyewear", "shades", "aviator", "lens", "نظارة", "نظارات"],
};
const CAT_IMG: Record<CategorySlug, string> = {
  perfumes: "perfume",
  watches: "watch",
  sunglasses: "sunglasses",
};

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html: string, key: string): string {
  const a = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
  );
  if (a) return decode(a[1]);
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, "i"),
  );
  return b ? decode(b[1]) : "";
}

function jsonLd(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const m of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const j = JSON.parse(m[1].trim());
      if (Array.isArray(j)) out.push(...j);
      else if (j["@graph"]) out.push(...j["@graph"]);
      else out.push(j);
    } catch {
      /* ignore malformed */
    }
  }
  return out;
}

/** True for loopback / private / link-local / unique-local IPs (SSRF targets). */
function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return (
      v === "::1" ||
      v === "::" ||
      v.startsWith("fc") ||
      v.startsWith("fd") ||
      v.startsWith("fe80") ||
      v.startsWith("::ffff:") // IPv4-mapped — caller re-checks the v4 part
    );
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) || // link-local + cloud metadata (169.254.169.254)
    a >= 224 // multicast / reserved
  );
}

/**
 * Reject non-public fetch targets before scraping. Admin-gated, but a forged or
 * misused call could otherwise probe internal services (n8n, DB, cloud metadata).
 */
async function assertPublicUrl(raw: string): Promise<void> {
  const u = new URL(raw);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("blocked host");
  }
  const { address } = await lookup(host);
  const mapped = address.toLowerCase().startsWith("::ffff:")
    ? address.slice(7)
    : address;
  if (isPrivateIp(mapped)) throw new Error("blocked address");
}

function guessCategory(text: string): CategorySlug {
  const t = text.toLowerCase();
  for (const c of Object.keys(CAT_KEYWORDS) as CategorySlug[]) {
    if (CAT_KEYWORDS[c].some((k) => t.includes(k))) return c;
  }
  return "perfumes";
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const url = (body.url ?? "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Enter a valid product URL" }, { status: 400 });
  }
  try {
    await assertPublicUrl(url);
  } catch {
    return NextResponse.json(
      { error: "That URL is not allowed" },
      { status: 400 },
    );
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "";
    }
  })();
  const retailer = /noon\./i.test(host) ? "noon" : "amazon";

  // ── 1) Scrape the page ─────────────────────────────────────────────────────
  let title = "";
  let image = "";
  let description = "";
  let brand = "";
  let price: number | null = null;
  let fetched = false;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    });
    const html = await res.text();
    fetched = res.ok && html.length > 500;
    title = meta(html, "og:title") || decode(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "");
    image = meta(html, "og:image");
    description = meta(html, "og:description");
    const pm = meta(html, "og:price:amount") || meta(html, "product:price:amount");
    if (pm) {
      const n = parseFloat(pm.replace(/[^\d.]/g, ""));
      if (Number.isFinite(n)) price = Math.round(n);
    }
    for (const node of jsonLd(html)) {
      const type = node["@type"];
      const isProduct =
        type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;
      if (!title && typeof node.name === "string") title = node.name;
      if (!image && node.image)
        image = Array.isArray(node.image) ? String(node.image[0]) : String(node.image);
      if (!description && typeof node.description === "string") description = node.description;
      const b = node.brand as { name?: string } | string | undefined;
      if (!brand && b) brand = typeof b === "string" ? b : (b.name ?? "");
      const offers = node.offers as { price?: string | number } | { price?: string | number }[] | undefined;
      const off = Array.isArray(offers) ? offers[0] : offers;
      if (off?.price != null && price == null) {
        const n = parseFloat(String(off.price));
        if (Number.isFinite(n)) price = Math.round(n);
      }
    }
    title = decode(title).slice(0, 200);
    description = decode(description).slice(0, 600);
  } catch {
    /* page blocked / timed out — fall back to URL-only generation */
  }

  // ── 2) Generate the bilingual luxury entry ────────────────────────────────
  const key = process.env.ANTHROPIC_API_KEY;
  const baseText = `${title} ${description}`.trim();
  const fallbackCategory = guessCategory(baseText || url);

  if (!key) {
    // No AI — return what we scraped so the admin can complete it.
    return NextResponse.json({
      ok: true,
      ai: false,
      fetched,
      draft: {
        name: title,
        nameAr: "",
        blurb: description,
        blurbAr: "",
        category: fallbackCategory,
        brand: brand || "ELITE",
        priceAed: price,
        badge: "best-pick",
        bestFor: "",
        bestForAr: "",
        pros: [],
        prosAr: [],
        cons: [],
        consAr: [],
        features: [],
        featuresAr: [],
      },
      image: image || `/brand/products/${CAT_IMG[fallbackCategory]}.png`,
      retailer,
      url,
      note: "AI not configured — basic fields from the page only.",
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });
    const system =
      `You write catalogue entries for Elite Market, a curated luxury affiliate storefront in the UAE. ` +
      `From the scraped retailer product info below, produce a polished bilingual entry. ` +
      `Arabic must use NO tashkeel (no diacritics). Keep it premium, specific and honest — no hype, no invented specs. ` +
      `Pick "category" from exactly: perfumes | watches | sunglasses. ` +
      `Pick "badge" from exactly: best-pick | luxury-deal | editor-choice. ` +
      `If a real price is given, return it as an integer in "priceAed" (the UAE retailers list AED); else null. ` +
      `Return ONLY a JSON object, no markdown, with keys: ` +
      `{"name","nameAr","blurb","blurbAr","category","badge","brand","priceAed","bestFor","bestForAr",` +
      `"pros":[3],"prosAr":[3],"cons":[1-2],"consAr":[1-2],"features":[3],"featuresAr":[3]}.`;
    const user =
      `Retailer: ${retailer}\nProduct URL: ${url}\n` +
      `Title: ${title || "(could not read — infer a luxury product from the URL)"}\n` +
      `Description: ${description || "(none)"}\n` +
      `Brand: ${brand || "(unknown)"}\nPrice: ${price ?? "(unknown)"}`;

    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1100,
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const ai = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    const category: CategorySlug = CATS.includes(ai.category) ? ai.category : fallbackCategory;
    const badge: Badge = BADGES.includes(ai.badge) ? ai.badge : "best-pick";

    return NextResponse.json({
      ok: true,
      ai: true,
      fetched,
      draft: {
        name: ai.name ?? title,
        nameAr: ai.nameAr ?? "",
        blurb: ai.blurb ?? "",
        blurbAr: ai.blurbAr ?? "",
        category,
        brand: ai.brand || brand || "ELITE",
        priceAed: typeof ai.priceAed === "number" ? ai.priceAed : price,
        badge,
        bestFor: ai.bestFor ?? "",
        bestForAr: ai.bestForAr ?? "",
        pros: ai.pros ?? [],
        prosAr: ai.prosAr ?? [],
        cons: ai.cons ?? [],
        consAr: ai.consAr ?? [],
        features: ai.features ?? [],
        featuresAr: ai.featuresAr ?? [],
      },
      image: image || `/brand/products/${CAT_IMG[category]}.png`,
      retailer,
      url,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      ai: false,
      fetched,
      draft: {
        name: title,
        nameAr: "",
        blurb: description,
        blurbAr: "",
        category: fallbackCategory,
        brand: brand || "ELITE",
        priceAed: price,
        badge: "best-pick",
        bestFor: "",
        bestForAr: "",
        pros: [],
        prosAr: [],
        cons: [],
        consAr: [],
        features: [],
        featuresAr: [],
      },
      image: image || `/brand/products/${CAT_IMG[fallbackCategory]}.png`,
      retailer,
      url,
      note: "AI generation failed — basic fields from the page only.",
    });
  }
}
