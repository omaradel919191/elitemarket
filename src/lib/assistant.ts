import { getAllProducts, localized } from "./catalog";
import type { CategorySlug } from "./site";

/**
 * Deterministic recommendation fallback for the shopping assistant. Used when
 * ANTHROPIC_API_KEY is not configured, and as a safety net if the AI call
 * fails. Parses category + price/deal intent from the query and ranks the
 * catalog by rating. No external calls.
 */

const CAT_KEYWORDS: Record<CategorySlug, string[]> = {
  perfumes: ["perfume", "fragrance", "scent", "cologne", "parfum", "عطر", "عطور", "برفان", "ريحة"],
  watches: ["watch", "watches", "timepiece", "wrist", "ساعة", "ساعات"],
  sunglasses: ["sunglass", "sunglasses", "eyewear", "shades", "glasses", "نظارة", "نظارات", "شمسية"],
  beauty: ["beauty", "skincare", "skin", "cream", "serum", "care", "عناية", "كريم", "سيروم", "بشرة", "تجميل"],
};

function parseMaxPrice(q: string): number | null {
  const m =
    q.match(/(?:under|below|less than|max|اقل من|تحت|حتى|في حدود)\s*([\d,]{2,7})/i) ||
    q.match(/([\d,]{2,7})\s*(?:aed|درهم|dhs?)/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function recommend(
  query: string,
  locale: string,
): { reply: string; slugs: string[] } {
  const q = query.toLowerCase();
  const all = getAllProducts();
  const cats = (Object.keys(CAT_KEYWORDS) as CategorySlug[]).filter((c) =>
    CAT_KEYWORDS[c].some((k) => q.includes(k)),
  );
  const maxPrice = parseMaxPrice(q);
  const wantsDeal = /\b(deal|deals|offer|discount|sale|cheap)\b|عرض|خصم|تخفيض/.test(q);

  let pool = all;
  if (cats.length) pool = pool.filter((p) => cats.includes(p.category));
  if (maxPrice != null)
    pool = pool.filter((p) => p.priceAed == null || p.priceAed <= maxPrice);
  if (wantsDeal) pool = pool.filter((p) => p.deal);

  pool = [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  if (!pool.length)
    pool = [...all].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);

  const ar = locale === "ar";
  const reply = ar
    ? `اخترت لك ${pool.length} قطع قد تناسبك${maxPrice ? ` ضمن ${maxPrice} درهم` : ""}. اضغط اي منتج لمعرفة التفاصيل والشراء.`
    : `Here are ${pool.length} pieces that could suit you${maxPrice ? ` under AED ${maxPrice}` : ""}. Tap any to see the details and buy.`;

  return { reply, slugs: pool.map((p) => p.slug) };
}

/** Compact catalog used to ground the AI assistant. */
export function catalogForPrompt(locale: string) {
  return getAllProducts().map((p) => {
    const l = localized(p, locale);
    return {
      slug: p.slug,
      name: l.name,
      category: p.category,
      priceAed: p.priceAed ?? null,
      rating: p.rating ?? null,
      deal: !!p.deal,
      blurb: l.blurb,
    };
  });
}
