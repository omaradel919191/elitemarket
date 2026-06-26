import type { MetadataRoute } from "next";
import { SITE, CATEGORIES } from "@/lib/site";
import { getAllProducts } from "@/lib/catalog";

/**
 * Sitemap with en/ar alternates. Default locale (en) is unprefixed, ar is
 * /ar-prefixed (next-intl localePrefix "as-needed"). Indexable routes only —
 * /search, /wishlist, /compare, /admin and /go are excluded (noindex).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  const paths = [
    "",
    "/shop",
    "/deals",
    "/about",
    "/contact",
    "/blog",
    "/guides",
    "/affiliate-disclosure",
    "/privacy",
    "/terms",
    ...CATEGORIES.map((c) => `/category/${c.slug}`),
    ...getAllProducts().map((p) => `/product/${p.slug}`),
  ];

  return paths.map((path) => {
    const en = `${base}${path || "/"}`;
    const ar = `${base}/ar${path}`;
    return {
      url: en,
      changeFrequency: path.startsWith("/product") ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/product") ? 0.8 : 0.6,
      alternates: { languages: { en, ar } },
    };
  });
}
