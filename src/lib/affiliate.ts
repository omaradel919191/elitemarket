import type { Retailer } from "./catalog";

/**
 * Append the configured affiliate parameters to a retailer URL. When the env
 * var is unset the original URL passes through unchanged (honest fallback —
 * we never invent tags). Owner sets these in M4:
 *   AMAZON_AFFILIATE_TAG   e.g. "elitemarket-21"   → &tag=elitemarket-21
 *   NOON_AFFILIATE_QUERY   e.g. "o=abc123"         → &o=abc123  (raw query)
 */
export function withAffiliate(url: string, retailer: Retailer): string {
  try {
    const u = new URL(url);
    if (retailer === "amazon") {
      const tag = process.env.AMAZON_AFFILIATE_TAG;
      if (tag) u.searchParams.set("tag", tag);
    } else if (retailer === "noon") {
      const raw = process.env.NOON_AFFILIATE_QUERY;
      if (raw) {
        for (const pair of raw.split("&")) {
          const [k, v = ""] = pair.split("=");
          if (k) u.searchParams.set(k, v);
        }
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}
