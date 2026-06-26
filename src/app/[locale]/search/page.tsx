import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { SearchClient } from "@/components/shop/search-client";
import { getAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("search");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
      <section className="pb-28">
        <SearchClient products={getAllProducts()} />
      </section>
    </>
  );
}
