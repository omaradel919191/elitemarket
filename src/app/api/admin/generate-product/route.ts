import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import type { CategorySlug } from "@/lib/site";

type Input = {
  name?: string;
  brand?: string;
  category?: CategorySlug;
  priceAed?: number | null;
  notes?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Category slug → placeholder image filename (real files are singular).
const CAT_IMAGE: Record<CategorySlug, string> = {
  perfumes: "perfume",
  watches: "watch",
  sunglasses: "sunglasses",
  beauty: "beauty",
};

function imageFor(category: CategorySlug): string {
  return `/brand/products/${CAT_IMAGE[category] ?? "perfume"}.png`;
}

function scaffold(input: Input) {
  return {
    slug: slugify(`${input.brand || "elite"}-${input.name || "product"}`),
    category: input.category ?? "perfumes",
    brand: input.brand || "ELITE",
    name: input.name || "",
    nameAr: "",
    blurb: input.notes || "",
    blurbAr: "",
    image: imageFor(input.category ?? "perfumes"),
    rating: null,
    priceAed: input.priceAed ?? null,
    bestFor: "",
    bestForAr: "",
    pros: [],
    prosAr: [],
    cons: [],
    consAr: [],
    features: [],
    featuresAr: [],
    _note:
      "AI is not configured (no ANTHROPIC_API_KEY). This is a blank scaffold — fill copy manually or set the key for bilingual generation.",
  };
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: Input;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!input.name?.trim() || !input.category) {
    return NextResponse.json(
      { error: "name and category are required" },
      { status: 400 },
    );
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ draft: scaffold(input), ai: false });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });
    const system =
      `You write product entries for Elite Market, a curated luxury affiliate storefront in the UAE. ` +
      `Given the input, produce a bilingual product draft. Arabic must use NO tashkeel (no diacritics). ` +
      `Keep copy honest, specific and premium — no hype. ` +
      `Return ONLY a JSON object, no markdown, with exactly these keys: ` +
      `{"slug": string (kebab-case), "name": string, "nameAr": string, "blurb": string (<=140 chars), "blurbAr": string, ` +
      `"bestFor": string, "bestForAr": string, "pros": string[3], "prosAr": string[3], "cons": string[1-2], "consAr": string[1-2], ` +
      `"features": string[3], "featuresAr": string[3]}.`;
    const user = `Category: ${input.category}\nBrand: ${input.brand || "ELITE"}\nName: ${input.name}\nIndicative price (AED): ${input.priceAed ?? "unknown"}\nNotes: ${input.notes || "none"}`;

    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = res.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("");
    const json = text.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
    const ai = JSON.parse(json);

    const draft = {
      slug: ai.slug || slugify(`${input.brand || "elite"}-${input.name}`),
      category: input.category,
      brand: input.brand || "ELITE",
      name: ai.name ?? input.name,
      nameAr: ai.nameAr ?? "",
      blurb: ai.blurb ?? "",
      blurbAr: ai.blurbAr ?? "",
      image: imageFor(input.category),
      rating: null,
      priceAed: input.priceAed ?? null,
      bestFor: ai.bestFor ?? "",
      bestForAr: ai.bestForAr ?? "",
      pros: ai.pros ?? [],
      prosAr: ai.prosAr ?? [],
      cons: ai.cons ?? [],
      consAr: ai.consAr ?? [],
      features: ai.features ?? [],
      featuresAr: ai.featuresAr ?? [],
    };
    return NextResponse.json({ draft, ai: true });
  } catch {
    return NextResponse.json({ draft: scaffold(input), ai: false });
  }
}
