import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryFilter } from "@/components/shop/category-filter";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { isCategorySlug, type CategorySlug } from "@/lib/site";
import { getProductsByCategory, getActiveCategorySlugs } from "@/lib/catalog";
import { toCardProduct } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isCategorySlug(slug)) return {};
  const tc = await getTranslations({ locale, namespace: "categories" });
  return {
    title: tc(`${slug}.name`),
    description: tc(`${slug}.tagline`),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  setRequestLocale(locale);

  const tc = await getTranslations("categories");
  const t = await getTranslations("category");

  const cat = slug as CategorySlug;
  const products = getProductsByCategory(cat).map(toCardProduct);
  const activeCategories = getActiveCategorySlugs();

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={tc(`${slug}.name`)}
        subtitle={tc(`${slug}.tagline`)}
      />
      <section className="pb-28">
        <Container>
          <CategoryFilter categories={activeCategories} active={slug} />
          <div className="mt-8">
            <ShopBrowser
              products={products}
              locale={locale}
              lockedCategory={cat}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
