import type { CategorySlug } from "./site";

/**
 * Runtime catalog. Pages read from here so the storefront works before a
 * database is provisioned. The shape mirrors src/db/schema.ts — swapping the
 * accessors below to query Drizzle later is a drop-in change.
 *
 * NOTE: `SEED` is a SMALL set of clearly-marked EXAMPLE entries so the Shop /
 * Category / Product / Deals pages render real-looking content for review.
 * It is NOT a real product catalogue — the owner populates real products
 * (with real Amazon/Noon URLs) later. Retailer links here point to honest
 * Amazon/Noon SEARCH results for the item, never fabricated product pages.
 */

export type Retailer = "amazon" | "noon";

export type RetailerLink = {
  retailer: Retailer;
  /** Destination URL (search or product). Affiliate tag is appended at /go. */
  url: string;
  /** Indicative price in AED, if known. */
  priceAed?: number;
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
  rating?: number;
  priceAed?: number;
  deal?: boolean;
  /** Original price when on deal (for strike-through). */
  wasAed?: number;
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

const amazon = (q: string): string =>
  `https://www.amazon.ae/s?k=${encodeURIComponent(q)}`;
const noon = (q: string): string =>
  `https://www.noon.com/uae-en/search/?q=${encodeURIComponent(q)}`;

// ── Example seed (replace with real catalogue / DB rows) ─────────────────────
const SEED: Product[] = [
  {
    slug: "elite-noir-extrait",
    category: "perfumes",
    brand: "ELITE",
    name: "Noir Extrait de Parfum",
    nameAr: "نوار اكستريه دو بارفان",
    blurb: "A deep amber-oud signature with a long, warm trail.",
    blurbAr: "توقيع عنبري عودي عميق باثر دافئ يدوم طويلا.",
    image: "/brand/products/perfume.png",
    rating: 4.8,
    priceAed: 420,
    bestFor: "Evening wear and cooler months.",
    bestForAr: "السهرات والاجواء الباردة.",
    pros: ["Exceptional longevity", "Rich, refined dry-down", "Elegant bottle"],
    prosAr: ["ثبات استثنائي", "قاعدة راقية وغنية", "زجاجة انيقة"],
    cons: ["Bold for daytime office use"],
    consAr: ["قوي على دوام النهار في المكتب"],
    features: ["Extrait concentration", "Amber · Oud · Vanilla", "50ml"],
    featuresAr: ["تركيز اكستريه", "عنبر · عود · فانيليا", "50 مل"],
    links: [
      { retailer: "amazon", url: amazon("luxury oud extrait perfume"), priceAed: 420 },
      { retailer: "noon", url: noon("oud extrait perfume"), priceAed: 435 },
    ],
  },
  {
    slug: "elite-rose-eau",
    category: "perfumes",
    brand: "ELITE",
    name: "Rose Eau de Parfum",
    nameAr: "روز او دو بارفان",
    blurb: "A luminous modern rose, fresh on top, soft musk beneath.",
    blurbAr: "وردة عصرية مشرقة، انتعاش في البداية ومسك ناعم في القاعدة.",
    image: "/brand/products/perfume.png",
    rating: 4.6,
    priceAed: 360,
    bestFor: "Daytime and warm weather.",
    bestForAr: "النهار والاجواء الدافئة.",
    pros: ["Versatile and clean", "Great projection"],
    prosAr: ["متعدد الاستخدامات ونظيف", "انتشار جيد"],
    cons: ["Moderate longevity"],
    consAr: ["ثبات متوسط"],
    features: ["EDP concentration", "Rose · Musk · Citrus", "75ml"],
    featuresAr: ["تركيز او دو بارفان", "ورد · مسك · حمضيات", "75 مل"],
    links: [
      { retailer: "amazon", url: amazon("rose eau de parfum"), priceAed: 360 },
      { retailer: "noon", url: noon("rose eau de parfum") },
    ],
  },
  {
    slug: "elite-skeleton-automatic",
    category: "watches",
    brand: "ELITE",
    name: "Skeleton Automatic",
    nameAr: "سكيلتون اوتوماتيك",
    blurb: "An open-worked automatic with a gold case and sapphire crystal.",
    blurbAr: "ساعة اوتوماتيك مفرغة بعلبة ذهبية وزجاج سفير.",
    image: "/brand/products/watch.png",
    rating: 4.7,
    priceAed: 1850,
    deal: true,
    wasAed: 2300,
    bestFor: "Statement dress watch.",
    bestForAr: "ساعة رسمية لافتة.",
    pros: ["Mechanical automatic movement", "Exhibition caseback", "Sapphire glass"],
    prosAr: ["حركة اوتوماتيك ميكانيكية", "ظهر شفاف يعرض الحركة", "زجاج سفير"],
    cons: ["Sized for larger wrists"],
    consAr: ["مقاسها مناسب للمعصم الكبير"],
    features: ["Automatic movement", "316L gold-tone case", "5 ATM water resistance"],
    featuresAr: ["حركة اوتوماتيك", "علبة ستيل بطلاء ذهبي", "مقاومة ماء 5 ATM"],
    links: [
      { retailer: "amazon", url: amazon("skeleton automatic gold watch"), priceAed: 1850 },
      { retailer: "noon", url: noon("skeleton automatic watch"), priceAed: 1899 },
    ],
  },
  {
    slug: "elite-classic-moonphase",
    category: "watches",
    brand: "ELITE",
    name: "Classic Moonphase",
    nameAr: "كلاسيك مونفيز",
    blurb: "A slim dress watch with a moonphase complication.",
    blurbAr: "ساعة رسمية نحيفة بتعقيد طور القمر.",
    image: "/brand/products/watch.png",
    rating: 4.5,
    priceAed: 1400,
    bestFor: "Formal occasions.",
    bestForAr: "المناسبات الرسمية.",
    pros: ["Elegant slim profile", "Moonphase display"],
    prosAr: ["تصميم نحيف انيق", "عرض طور القمر"],
    cons: ["Quartz, not automatic"],
    consAr: ["كوارتز وليست اوتوماتيك"],
    features: ["Quartz movement", "Leather strap", "Moonphase sub-dial"],
    featuresAr: ["حركة كوارتز", "سوار جلد", "قرص فرعي لطور القمر"],
    links: [
      { retailer: "amazon", url: amazon("moonphase dress watch"), priceAed: 1400 },
      { retailer: "noon", url: noon("moonphase watch") },
    ],
  },
  {
    slug: "elite-aviator-gold",
    category: "sunglasses",
    brand: "ELITE",
    name: "Aviator Gold",
    nameAr: "افياتور جولد",
    blurb: "Gold-framed aviators with gradient lenses and UV400 protection.",
    blurbAr: "نظارة افياتور باطار ذهبي وعدسات متدرجة وحماية UV400.",
    image: "/brand/products/sunglasses.png",
    rating: 4.6,
    priceAed: 520,
    bestFor: "Everyday and travel.",
    bestForAr: "الاستخدام اليومي والسفر.",
    pros: ["UV400 protection", "Lightweight metal frame", "Timeless shape"],
    prosAr: ["حماية UV400", "اطار معدني خفيف", "تصميم خالد"],
    cons: ["Classic fit, not oversized"],
    consAr: ["مقاس كلاسيكي وليس كبير"],
    features: ["UV400 lenses", "Gold-tone metal frame", "Includes case"],
    featuresAr: ["عدسات UV400", "اطار معدني ذهبي", "يشمل جراب"],
    links: [
      { retailer: "amazon", url: amazon("gold aviator sunglasses uv400"), priceAed: 520 },
      { retailer: "noon", url: noon("gold aviator sunglasses"), priceAed: 499 },
    ],
  },
  {
    slug: "elite-shield-black",
    category: "sunglasses",
    brand: "ELITE",
    name: "Shield Black",
    nameAr: "شيلد بلاك",
    blurb: "A bold one-piece shield with polarized lenses.",
    blurbAr: "نظارة شيلد جريئة بقطعة واحدة وعدسات مستقطبة.",
    image: "/brand/products/sunglasses.png",
    rating: 4.4,
    priceAed: 460,
    deal: true,
    wasAed: 600,
    bestFor: "Driving and bright sun.",
    bestForAr: "القيادة والشمس الساطعة.",
    pros: ["Polarized glare control", "Modern statement shape"],
    prosAr: ["تقليل الوهج بالاستقطاب", "تصميم عصري لافت"],
    cons: ["Statement look not for everyone"],
    consAr: ["مظهر جريء لا يناسب الجميع"],
    features: ["Polarized lenses", "One-piece shield", "UV400"],
    featuresAr: ["عدسات مستقطبة", "درع بقطعة واحدة", "UV400"],
    links: [
      { retailer: "amazon", url: amazon("polarized shield sunglasses"), priceAed: 460 },
      { retailer: "noon", url: noon("shield sunglasses polarized") },
    ],
  },
  {
    slug: "elite-ultimate-cream",
    category: "beauty",
    brand: "ELITE",
    name: "Ultimate Cream",
    nameAr: "الكريم الفائق",
    blurb: "A rich restorative night cream with a gold-engraved lid.",
    blurbAr: "كريم ليلي غني للترميم بغطاء منقوش بالذهب.",
    image: "/brand/products/beauty.png",
    rating: 4.7,
    priceAed: 290,
    bestFor: "Overnight recovery.",
    bestForAr: "الترميم اثناء الليل.",
    pros: ["Deeply hydrating", "Luxurious texture"],
    prosAr: ["ترطيب عميق", "ملمس فاخر"],
    cons: ["Rich for very oily skin"],
    consAr: ["غني على البشرة الدهنية جدا"],
    features: ["50ml jar", "Night formula", "Dermatologist-friendly"],
    featuresAr: ["برطمان 50 مل", "تركيبة ليلية", "مناسب لطبيب الجلدية"],
    links: [
      { retailer: "amazon", url: amazon("luxury restorative night cream"), priceAed: 290 },
      { retailer: "noon", url: noon("luxury night cream"), priceAed: 305 },
    ],
  },
  {
    slug: "elite-radiance-serum",
    category: "beauty",
    brand: "ELITE",
    name: "Radiance Serum",
    nameAr: "سيروم الاشراق",
    blurb: "A lightweight vitamin-C serum for a brighter, even tone.",
    blurbAr: "سيروم خفيف بفيتامين سي لاشراق ولون موحد.",
    image: "/brand/products/beauty.png",
    rating: 4.5,
    priceAed: 210,
    bestFor: "Morning routine.",
    bestForAr: "روتين الصباح.",
    pros: ["Brightening vitamin C", "Absorbs fast"],
    prosAr: ["فيتامين سي مشرق", "امتصاص سريع"],
    cons: ["Introduce gradually if sensitive"],
    consAr: ["ادخليه تدريجيا للبشرة الحساسة"],
    features: ["30ml dropper", "Vitamin C + E", "Fragrance-free"],
    featuresAr: ["قطارة 30 مل", "فيتامين سي + اي", "خالي من العطر"],
    links: [
      { retailer: "amazon", url: amazon("vitamin c radiance serum"), priceAed: 210 },
      { retailer: "noon", url: noon("vitamin c serum") },
    ],
  },
];

// ── Accessors (swap to Drizzle queries when DB is wired) ─────────────────────

export function getAllProducts(): Product[] {
  return SEED;
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return SEED.filter((p) => p.category === category);
}

export function getProduct(slug: string): Product | undefined {
  return SEED.find((p) => p.slug === slug);
}

export function getDeals(): Product[] {
  return SEED.filter((p) => p.deal);
}

export function getRelated(product: Product, limit = 3): Product[] {
  return SEED.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEED.filter((p) =>
    [p.name, p.nameAr, p.brand, p.blurb, p.blurbAr, p.category]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function getRetailerLink(
  product: Product,
  retailer: Retailer,
): RetailerLink | undefined {
  return product.links.find((l) => l.retailer === retailer);
}

/** Pick the right-language fields for a product given the active locale. */
export function localized(p: Product, locale: string) {
  const ar = locale === "ar";
  return {
    name: ar ? p.nameAr : p.name,
    blurb: ar ? p.blurbAr : p.blurb,
    bestFor: (ar ? p.bestForAr : p.bestFor) ?? "",
    pros: (ar ? p.prosAr : p.pros) ?? [],
    cons: (ar ? p.consAr : p.cons) ?? [],
    features: (ar ? p.featuresAr : p.features) ?? [],
  };
}
