import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { HeroCinematic } from "@/components/home/hero-cinematic";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return { title: t("titleLine1"), description: t("subtitle") };
}

/**
 * The cinematic scroll experience, kept as its own page. The homepage is now
 * product-first for conversion; this is where the full brand film lives for
 * anyone who taps "Watch the experience".
 */
export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HeroCinematic />;
}
