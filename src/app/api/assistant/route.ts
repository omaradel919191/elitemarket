import { NextResponse, type NextRequest } from "next/server";
import { getProduct, localized, isOwn } from "@/lib/catalog";
import { recommend, catalogForPrompt } from "@/lib/assistant";
import { rateLimit, clientIp } from "@/lib/rate-limit";

type Turn = { role: "user" | "assistant"; content: string };

const MAX_MESSAGE = 1000;
const MAX_TURN = 2000;

export async function POST(req: NextRequest) {
  // Public, paid endpoint (calls Anthropic): cap abuse at 20 req/IP/5 min.
  const ip = clientIp(req.headers);
  const limited = rateLimit(`assistant:${ip}`, 20, 5 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: { message?: string; locale?: string; history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE);
  const locale = body.locale === "ar" ? "ar" : "en";
  const history = (Array.isArray(body.history) ? body.history.slice(-6) : [])
    .filter(
      (t): t is Turn =>
        t != null &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string",
    )
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN) }));
  if (!message) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  let reply: string;
  let slugs: string[];

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: key });
      const catalog = catalogForPrompt(locale);
      const system =
        `You are the shopping assistant for Elite Market, a curated luxury store (perfumes, watches, sunglasses) in the UAE. ` +
        `Some pieces are sold and shipped by Elite Market; others link out to retailers like Amazon and Noon. ` +
        `Recommend at most 3 products, chosen ONLY from this catalog: ${JSON.stringify(catalog)}. ` +
        `Reply warmly and briefly in ${locale === "ar" ? "Arabic with NO tashkeel (diacritics)" : "English"}. ` +
        `Respond with ONLY a JSON object, no markdown: {"reply": string, "slugs": string[]}. ` +
        `"slugs" must be slugs from the catalog (or empty if nothing fits).`;
      const res = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system,
        messages: [
          ...history.map((t) => ({ role: t.role, content: t.content })),
          { role: "user" as const, content: message },
        ],
      });
      const text = res.content
        .map((c) => (c.type === "text" ? c.text : ""))
        .join("");
      const json = text.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
      const parsed = JSON.parse(json) as { reply?: string; slugs?: string[] };
      reply = (parsed.reply ?? "").trim();
      slugs = (parsed.slugs ?? []).filter((s) => Boolean(getProduct(s))).slice(0, 3);
      if (!reply) throw new Error("empty AI reply");
    } catch {
      ({ reply, slugs } = recommend(message, locale));
    }
  } else {
    ({ reply, slugs } = recommend(message, locale));
  }

  const products = slugs
    .map((s) => {
      const p = getProduct(s);
      if (!p) return null;
      const l = localized(p, locale);
      return {
        slug: p.slug,
        name: l.name,
        image: p.image,
        priceAed: isOwn(p) ? (p.priceAed ?? null) : null,
        category: p.category,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ reply, products });
}
