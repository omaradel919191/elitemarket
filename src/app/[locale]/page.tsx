import { setRequestLocale } from "next-intl/server";
import { HeroSearch } from "@/components/home/hero-search";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { HowItWorks } from "@/components/home/how-it-works";
import { ValueProps } from "@/components/home/value-props";
import { CtaBand } from "@/components/home/cta-band";
import { getActiveCategorySlugs } from "@/lib/catalog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = getActiveCategorySlugs();

  return (
    <>
      {/* Product-first: search + category shortcuts on the very first screen. */}
      <HeroSearch categories={categories} />
      {/* Real products immediately — the fastest path to a purchase. */}
      <FeaturedProducts locale={locale} />
      <CategoryShowcase />
      <HowItWorks />
      <ValueProps />
      <CtaBand />
    </>
  );
}
