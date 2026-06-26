import type { Product } from "@/lib/catalog-types";

/**
 * First-launch catalogue — ONE real product per category. These are the live
 * launch entries (NOT demo/seed): real luxury copy + on-brand imagery, with
 * the affiliate URLs intentionally LEFT EMPTY for the owner to fill via the
 * admin (or by editing content/products.json). Prices are placeholders the
 * owner updates. Used to seed content/products.json on first run.
 */
export const LAUNCH_PRODUCTS: Product[] = [
  {
    slug: "luxury-watch",
    category: "watches",
    brand: "ELITE",
    name: "Luxury Automatic Watch",
    nameAr: "ساعة فاخرة اوتوماتيك",
    blurb:
      "A skeleton automatic in gold and black — exposed movement, sapphire crystal, an heirloom on the wrist.",
    blurbAr:
      "ساعة اوتوماتيك مفرغة بالذهب والاسود — حركة مكشوفة وزجاج سفير، قطعة تورث على المعصم.",
    image: "/brand/products/watch.png",
    rating: null,
    priceAed: 1999,
    deal: false,
    wasAed: null,
    badge: "editor-choice",
    bestFor: "A statement dress watch.",
    bestForAr: "ساعة رسمية لافتة.",
    pros: ["Mechanical automatic movement", "Exhibition caseback", "Sapphire crystal"],
    prosAr: ["حركة اوتوماتيك ميكانيكية", "ظهر شفاف يعرض الحركة", "زجاج سفير"],
    cons: ["Sized for larger wrists"],
    consAr: ["مقاسها مناسب للمعصم الكبير"],
    features: ["Automatic movement", "Gold-tone case", "5 ATM water resistance"],
    featuresAr: ["حركة اوتوماتيك", "علبة بطلاء ذهبي", "مقاومة ماء 5 ATM"],
    links: [
      { retailer: "amazon", url: "", priceAed: null },
      { retailer: "noon", url: "", priceAed: null },
    ],
  },
  {
    slug: "luxury-perfume",
    category: "perfumes",
    brand: "ELITE",
    name: "Luxury Extrait de Parfum",
    nameAr: "عطر فاخر اكستريه",
    blurb:
      "A deep amber-oud signature with a long, warm trail — composed for presence, not noise.",
    blurbAr:
      "توقيع عنبري عودي عميق باثر دافئ يدوم طويلا — صُمم للحضور لا للضجيج.",
    image: "/brand/products/perfume.png",
    rating: null,
    priceAed: 499,
    deal: false,
    wasAed: null,
    badge: "best-pick",
    bestFor: "Evening wear and cooler months.",
    bestForAr: "السهرات والاجواء الباردة.",
    pros: ["Exceptional longevity", "Rich, refined dry-down", "Elegant bottle"],
    prosAr: ["ثبات استثنائي", "قاعدة راقية وغنية", "زجاجة انيقة"],
    cons: ["Bold for daytime office use"],
    consAr: ["قوي على دوام النهار في المكتب"],
    features: ["Extrait concentration", "Amber · Oud · Vanilla", "50ml"],
    featuresAr: ["تركيز اكستريه", "عنبر · عود · فانيليا", "50 مل"],
    links: [
      { retailer: "amazon", url: "", priceAed: null },
      { retailer: "noon", url: "", priceAed: null },
    ],
  },
  {
    slug: "luxury-sunglasses",
    category: "sunglasses",
    brand: "ELITE",
    name: "Luxury Gold Sunglasses",
    nameAr: "نظارة شمسية فاخرة بالذهب",
    blurb:
      "Gold-framed aviators with gradient lenses and full UV400 protection — timeless presence.",
    blurbAr:
      "نظارة افياتور باطار ذهبي وعدسات متدرجة وحماية UV400 كاملة — حضور خالد.",
    image: "/brand/products/sunglasses.png",
    rating: null,
    priceAed: 649,
    deal: true,
    wasAed: 850,
    badge: "luxury-deal",
    bestFor: "Everyday wear and travel.",
    bestForAr: "الاستخدام اليومي والسفر.",
    pros: ["UV400 protection", "Lightweight metal frame", "Timeless shape"],
    prosAr: ["حماية UV400", "اطار معدني خفيف", "تصميم خالد"],
    cons: ["Classic fit, not oversized"],
    consAr: ["مقاس كلاسيكي وليس كبير"],
    features: ["UV400 lenses", "Gold-tone metal frame", "Protective case included"],
    featuresAr: ["عدسات UV400", "اطار معدني ذهبي", "يشمل جراب حماية"],
    links: [
      { retailer: "amazon", url: "", priceAed: null },
      { retailer: "noon", url: "", priceAed: null },
    ],
  },
  {
    slug: "luxury-skincare",
    category: "beauty",
    brand: "ELITE",
    name: "Luxury Restorative Cream",
    nameAr: "كريم العناية الفاخر",
    blurb:
      "A rich restorative night cream with a gold-engraved lid — overnight recovery, elevated.",
    blurbAr:
      "كريم ليلي غني للترميم بغطاء منقوش بالذهب — ترميم ليلي بمستوى ارقى.",
    image: "/brand/products/beauty.png",
    rating: null,
    priceAed: 299,
    deal: false,
    wasAed: null,
    badge: "best-pick",
    bestFor: "Overnight recovery.",
    bestForAr: "الترميم اثناء الليل.",
    pros: ["Deeply hydrating", "Luxurious texture", "Gold-engraved jar"],
    prosAr: ["ترطيب عميق", "ملمس فاخر", "برطمان منقوش بالذهب"],
    cons: ["Rich for very oily skin"],
    consAr: ["غني على البشرة الدهنية جدا"],
    features: ["50ml jar", "Night formula", "Dermatologist-friendly"],
    featuresAr: ["برطمان 50 مل", "تركيبة ليلية", "مناسب لطبيب الجلدية"],
    links: [
      { retailer: "amazon", url: "", priceAed: null },
      { retailer: "noon", url: "", priceAed: null },
    ],
  },
];
