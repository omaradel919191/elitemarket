import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { HowItWorks } from "@/components/home/how-it-works";
import { ValueProps } from "@/components/home/value-props";
import { CtaBand } from "@/components/home/cta-band";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <CategoryShowcase />
      <HowItWorks />
      <ValueProps />
      <CtaBand />
    </>
  );
}
