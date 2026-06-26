import type { Retailer } from "./catalog-types";

/**
 * Append the configured affiliate parameters to a retailer URL. When the tag
 * is unset the original URL passes through unchanged (honest fallback — we
 * never invent tags). Owner sets these in production:
 *   AMAZON_ASSOCIATE_TAG   e.g. "elitemarke072-21"  -> &tag=elitemarke072-21
 *   NOON_AFFILIATE_TAG     e.g. "elitemarket"        -> &utm_source=elitemarket
 */
export function withAffiliate(url: string, retailer: Retailer): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (retailer === "amazon") {
      const tag = process.env.AMAZON_ASSOCIATE_TAG;
      if (tag) u.searchParams.set("tag", tag);
    } else if (retailer === "noon") {
      const tag = process.env.NOON_AFFILIATE_TAG;
      if (tag) u.searchParams.set("utm_source", tag);
    }
    return u.toString();
  } catch {
    return url;
  }
}
