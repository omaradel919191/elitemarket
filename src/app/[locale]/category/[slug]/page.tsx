import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryFilter } from "@/components/shop/category-filter";
import { ProductGrid } from "@/components/shop/product-grid";
import { CATEGORIES, type CategorySlug } from "@/lib/site";
import { getProductsByCategory } from "@/lib/catalog";

const SLUGS = CATEGORIES.map((c) => c.slug);

export const dynamic = "force-dynamic";

function isValid(slug: string): slug is CategorySlug {
  return (SLUGS as string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValid(slug)) return {};
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
  if (!isValid(slug)) notFound();
  setRequestLocale(locale);
  const tc = await getTranslations("categories");
  const t = await getTranslations("category");
  const products = getProductsByCategory(slug);

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={tc(`${slug}.name`)}
        subtitle={tc(`${slug}.tagline`)}
      />
      <section className="pb-28">
        <Container>
          <CategoryFilter active={slug} />
          <div className="mt-8">
            <ProductGrid products={products} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
