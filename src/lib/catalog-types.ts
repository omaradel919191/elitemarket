import type { CategorySlug } from "./site";

/**
 * Client-safe catalog types + pure helpers. No filesystem access here, so this
 * module can be imported by client components. The server-only data access
 * (read/write the products file) lives in catalog.ts.
 */

export type Retailer = "amazon" | "noon";

export type Badge = "best-pick" | "luxury-deal" | "editor-choice";

export type RetailerLink = {
  retailer: Retailer;
  /** Affiliate/product URL. Empty until the owner adds it. */
  url: string;
  priceAed?: number | null;
};

export type Product = {
  slug: string;
  category: CategorySlug;
  brand: string;
  name: string;
  nameAr: string;
  blurb: string;
  blurbAr: string;
  image: string;
  rating?: number | null;
  priceAed?: number | null;
  deal?: boolean;
  wasAed?: number | null;
  badge?: Badge | null;
  bestFor?: string;
  bestForAr?: string;
  pros?: string[];
  prosAr?: string[];
  cons?: string[];
  consAr?: string[];
  features?: string[];
  featuresAr?: string[];
  links: RetailerLink[];
};

/** Pick the right-language fields for a product given the active locale. */
export function localized(p: Product, locale: string) {
  const ar = locale === "ar";
  return {
    name: ar ? p.nameAr || p.name : p.name,
    blurb: ar ? p.blurbAr || p.blurb : p.blurb,
    bestFor: (ar ? p.bestForAr : p.bestFor) ?? "",
    pros: (ar ? p.prosAr : p.pros) ?? [],
    cons: (ar ? p.consAr : p.cons) ?? [],
    features: (ar ? p.featuresAr : p.features) ?? [],
  };
}

export function getRetailerLink(
  product: Product,
  retailer: Retailer,
): RetailerLink | undefined {
  return product.links.find((l) => l.retailer === retailer);
}

/** A retailer link that actually points somewhere (non-empty URL). */
export function hasLiveLink(product: Product, retailer?: Retailer): boolean {
  return product.links.some(
    (l) => (!retailer || l.retailer === retailer) && l.url.trim().length > 0,
  );
}

/** Pure search over a given product list (used client-side). */
export function filterProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.nameAr, p.brand, p.blurb, p.blurbAr, p.category]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
