import type { CategorySlug } from "./site";

/**
 * Client-safe catalog types + pure helpers. No filesystem access here, so this
 * module can be imported by client components. The server-only data access
 * (read/write the products file) lives in catalog.ts.
 */

export type Retailer = "amazon" | "noon";

export type Badge = "best-pick" | "luxury-deal" | "editor-choice";

/**
 * How a product is sold:
 *  - "own"       → our own product. Bought on-site (cart + Stripe checkout,
 *                  shipped via our courier). Uses priceAed + stock.
 *  - "affiliate" → we link out to Amazon/Noon. Uses links[]. No cart/payment.
 * The roadmap is own-first; affiliate stays optional and can be removed later.
 */
export type ProductSource = "own" | "affiliate";

/** Who a product is for. Drives the men/women/unisex filter under a category. */
export type Audience = "men" | "women" | "unisex";

export const AUDIENCES: Audience[] = ["men", "women", "unisex"];

export type RetailerLink = {
  retailer: Retailer;
  /** Affiliate/product URL. Empty until the owner adds it. */
  url: string;
  priceAed?: number | null;
};

/** An own-product option (e.g. perfume size) with its own price + stock. */
export type Variant = {
  id: string;
  name: string; // e.g. "50ml"
  priceAed: number;
  stock?: number | null; // null/undefined = not tracked
};

export type Product = {
  slug: string;
  category: CategorySlug;
  /** "own" (sold here) or "affiliate" (link out). Defaults to affiliate. */
  source: ProductSource;
  /** men | women | unisex. Defaults to unisex. */
  audience: Audience;
  brand: string;
  name: string;
  nameAr: string;
  blurb: string;
  blurbAr: string;
  /** Primary/cover image. */
  image: string;
  /** Additional gallery images (cover excluded). */
  images?: string[];
  rating?: number | null;
  priceAed?: number | null;
  /** Own products: units in stock. null/undefined = not tracked (always in stock). */
  stock?: number | null;
  /** Own products: optional options (e.g. sizes), each with its own price/stock. */
  variants?: Variant[];
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
  /** Affiliate retailer links (only meaningful when source === "affiliate"). */
  links: RetailerLink[];
};

/**
 * Fill in defaults for older/partial records so the rest of the app can rely on
 * source/audience/links always being present. Pure — safe on client and server.
 */
export function normalizeProduct(p: Partial<Product> & { slug: string }): Product {
  return {
    rating: null,
    priceAed: null,
    stock: null,
    deal: false,
    wasAed: null,
    badge: null,
    bestFor: "",
    bestForAr: "",
    pros: [],
    prosAr: [],
    cons: [],
    consAr: [],
    features: [],
    featuresAr: [],
    ...p,
    source: p.source === "own" ? "own" : "affiliate",
    audience:
      p.audience === "men" || p.audience === "women" ? p.audience : "unisex",
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    links: Array.isArray(p.links) ? p.links : [],
  } as Product;
}

/**
 * Slim a product down to just what a listing card + the client-side filters
 * need, dropping the heavy long-form arrays (pros/cons/features/bestFor and
 * extra gallery images). Cuts the payload serialized to the client browser on
 * listing pages with hundreds of products.
 */
export function toCardProduct(p: Product): Product {
  return {
    ...p,
    images: [],
    bestFor: "",
    bestForAr: "",
    pros: [],
    prosAr: [],
    cons: [],
    consAr: [],
    features: [],
    featuresAr: [],
  };
}

/** Own product (sold on-site). */
export function isOwn(p: Product): boolean {
  return p.source === "own";
}

/** Whether a product sells via variants (sizes/options). */
export function hasVariants(p: Product): boolean {
  return !!p.variants && p.variants.length > 0;
}

export function variantById(p: Product, id: string | undefined): Variant | undefined {
  if (!id) return undefined;
  return p.variants?.find((v) => v.id === id);
}

function variantBuyable(v: Variant): boolean {
  return v.priceAed > 0 && (v.stock == null || v.stock > 0);
}

/** Price to show on cards/listing — for variant products, the lowest option. */
export function displayPrice(p: Product): number | null {
  if (hasVariants(p)) {
    const prices = p.variants!.map((v) => v.priceAed).filter((n) => n > 0);
    return prices.length ? Math.min(...prices) : null;
  }
  return p.priceAed ?? null;
}

/** Own product that can actually be added to cart right now. */
export function isBuyable(p: Product): boolean {
  if (p.source !== "own") return false;
  if (hasVariants(p)) return p.variants!.some(variantBuyable);
  return p.priceAed != null && p.priceAed > 0 && (p.stock == null || p.stock > 0);
}

/** Own product that is configured but out of stock. */
export function isSoldOut(p: Product): boolean {
  if (p.source !== "own") return false;
  if (hasVariants(p)) return !p.variants!.some(variantBuyable);
  return typeof p.stock === "number" && p.stock <= 0;
}

/** Resolve the effective price/stock/label for a product + optional variant. */
export function resolveUnit(p: Product, variantId?: string) {
  const v = variantById(p, variantId);
  if (v) {
    return { priceAed: v.priceAed, stock: v.stock ?? null, variantName: v.name, variant: v };
  }
  return { priceAed: p.priceAed ?? null, stock: p.stock ?? null, variantName: "", variant: undefined };
}

/** Cover + extra images, deduped, cover first. */
export function galleryImages(p: Product): string[] {
  return [p.image, ...(p.images ?? [])].filter(
    (v, i, a) => !!v && a.indexOf(v) === i,
  );
}

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
