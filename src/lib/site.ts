import { SprayCan, Watch, Glasses, type LucideIcon } from "lucide-react";

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

export type CategorySlug = "perfumes" | "watches" | "sunglasses";

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
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function isCategorySlug(s: string): s is CategorySlug {
  return (CATEGORY_SLUGS as string[]).includes(s);
}
