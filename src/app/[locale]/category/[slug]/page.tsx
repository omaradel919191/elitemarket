import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryFilter } from "@/components/shop/category-filter";
import { AudienceFilter } from "@/components/shop/audience-filter";
import { ProductGrid } from "@/components/shop/product-grid";
import { isCategorySlug, type CategorySlug } from "@/lib/site";
import {
  getProductsByCategory,
  getActiveCategorySlugs,
  getAudiencesInCategory,
} from "@/lib/catalog";
import { AUDIENCES, type Audience } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";

function toAudience(v: string | undefined): Audience | undefined {
  return AUDIENCES.includes(v as Audience) ? (v as Audience) : undefined;
}

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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ for?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const audience = toAudience(sp.for);

  const tc = await getTranslations("categories");
  const t = await getTranslations("category");

  const cat = slug as CategorySlug;
  const products = getProductsByCategory(cat, audience);
  const activeCategories = getActiveCategorySlugs();
  const audiences = getAudiencesInCategory(cat);

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
          {audiences.length >= 2 && (
            <div className="mt-5">
              <AudienceFilter
                category={cat}
                audiences={audiences}
                active={audience}
              />
            </div>
          )}
          <div className="mt-8">
            <ProductGrid products={products} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
