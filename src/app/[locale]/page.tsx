import { setRequestLocale } from "next-intl/server";
import { HeroExperience } from "@/components/home/hero-experience";
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
      <HeroExperience />
      <CategoryShowcase />
      <HowItWorks />
      <ValueProps />
      <CtaBand />
    </>
  );
}
