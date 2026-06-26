import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryFilter } from "@/components/shop/category-filter";
import { ProductGrid } from "@/components/shop/product-grid";
import { getAllProducts, getActiveCategorySlugs } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const products = getAllProducts();
  const activeCategories = getActiveCategorySlugs();

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <section className="pb-28">
        <Container>
          <CategoryFilter categories={activeCategories} />
          <p className="mt-6 text-sm text-ash-dim">
            {t("count", { count: products.length })}
          </p>
          <div className="mt-6">
            <ProductGrid products={products} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
