import {
  SprayCan,
  Watch,
  Glasses,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const SITE = {
  name: "Elite Market",
  domain: "eliteperfumeuae.com",
  url: "https://eliteperfumeuae.com",
  email: "hello@eliteperfumeuae.com",
  taglineEn: "Discover Better. Shop Smarter.",
  taglineAr: "اكتشف افضل. تسوق اذكى.",
  social: {
    instagram: "https://instagram.com/elitemarket",
    youtube: "https://youtube.com/@elitemarket",
    tiktok: "https://tiktok.com/@elitemarket",
  },
} as const;

export type CategorySlug = "perfumes" | "watches" | "sunglasses" | "beauty";

export type CategoryDef = {
  slug: CategorySlug;
  icon: LucideIcon;
  /** Accent used in motion / glows for this world. */
  accent: string;
  /** Atmosphere keyword used by the scroll story. */
  mood: string;
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "perfumes", icon: SprayCan, accent: "#D4AF37", mood: "golden-light" },
  { slug: "watches", icon: Watch, accent: "#CBD2DA", mood: "mechanical" },
  { slug: "sunglasses", icon: Glasses, accent: "#C9A227", mood: "reflection" },
  { slug: "beauty", icon: Sparkles, accent: "#E7C766", mood: "glow" },
];

export const PRIMARY_NAV = [
  { href: "/shop", key: "shop" },
  { href: "/category/perfumes", key: "perfumes" },
  { href: "/category/watches", key: "watches" },
  { href: "/category/sunglasses", key: "sunglasses" },
  { href: "/category/beauty", key: "beauty" },
  { href: "/deals", key: "deals" },
  { href: "/blog", key: "blog" },
] as const;
