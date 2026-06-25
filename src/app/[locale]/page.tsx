import { setRequestLocale } from "next-intl/server";
import { HeroCinematic } from "@/components/home/hero-cinematic";
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
      <HeroCinematic />
      <CategoryShowcase />
      <HowItWorks />
      <ValueProps />
      <CtaBand />
    </>
  );
}
