import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, X, ChevronRight } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Rating } from "@/components/shop/rating";
import { BuyButtons } from "@/components/shop/buy-buttons";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductGrid } from "@/components/shop/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { getProduct, getRelated, localized, isOwn } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { formatAED } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const l = localized(product, locale);
  return {
    title: `${l.name} — ${product.brand}`,
    description: l.blurb,
    openGraph: { images: [product.image], title: l.name, description: l.blurb },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("product");
  const tc = await getTranslations("categories");
  const tn = await getTranslations("nav");
  const tb = await getTranslations("badge");
  const l = localized(product, locale);
  const own = isOwn(product);
  const related = getRelated(product);
  const lp = `/${locale}`;
  const badgeLabel = product.badge
    ? tb(product.badge)
    : product.deal
      ? t("deal")
      : null;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.name,
    image: `${SITE.url}${product.image}`,
    description: l.blurb,
    brand: { "@type": "Brand", name: product.brand },
    category: tc(`${product.category}.name`),
    ...(product.rating != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        bestRating: 5,
        ratingCount: 1,
      },
    }),
    ...(product.priceAed != null && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "AED",
        lowPrice: product.priceAed,
        availability: "https://schema.org/InStock",
        url: `${SITE.url}${lp}/product/${product.slug}`,
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tn("shop"), item: `${SITE.url}${lp}/shop` },
      {
        "@type": "ListItem",
        position: 2,
        name: tc(`${product.category}.name`),
        item: `${SITE.url}${lp}/category/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: l.name,
        item: `${SITE.url}${lp}/product/${product.slug}`,
      },
    ],
  };

  return (
    <article className="pt-28 pb-28 sm:pt-32">
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
      <Container>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-ash-dim">
          <Link href="/shop" className="transition-colors hover:text-gold">
            {tn("shop")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          <Link
            href={`/category/${product.category}`}
            className="transition-colors hover:text-gold"
          >
            {tc(`${product.category}.name`)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          <span className="text-ash">{l.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <Reveal>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-line/70 bg-black">
              <Image
                src={product.image}
                alt={l.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-10"
              />
              {badgeLabel && (
                <span className="absolute top-5 rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink ltr:left-5 rtl:right-5">
                  {badgeLabel}
                </span>
              )}
            </div>
          </Reveal>

          {/* Summary */}
          <Reveal delay={0.08} className="flex flex-col">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold">
              {product.brand}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-chrome sm:text-4xl">
              {l.name}
            </h1>
            {product.rating != null && (
              <Rating value={product.rating} className="mt-4" />
            )}
            <p className="mt-5 text-base leading-relaxed text-ash">{l.blurb}</p>

            {product.priceAed != null && (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold text-chrome">
                  {formatAED(product.priceAed, locale)}
                </span>
                {product.deal && product.wasAed != null && (
                  <span className="text-base text-ash-dim line-through">
                    {formatAED(product.wasAed, locale)}
                  </span>
                )}
              </div>
            )}
            <p className="mt-1.5 text-xs text-ash-dim">
              {own ? t("ownPriceNote") : t("priceNote")}
            </p>

            {l.bestFor && (
              <div className="mt-6 rounded-2xl border border-line/70 bg-surface/40 p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                  {t("bestFor")}
                </span>
                <p className="mt-1 text-sm text-ash">{l.bestFor}</p>
              </div>
            )}

            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ash-dim">
                {own ? t("buyTitle") : t("whereToBuy")}
              </p>
              {own ? (
                <>
                  <AddToCart
                    product={product}
                    locale={locale}
                    labels={{
                      add: t("addToCart"),
                      added: t("added"),
                      buyNow: t("buyNow"),
                      soldOut: t("soldOut"),
                      setup: t("checkoutSetup"),
                    }}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-ash-dim">
                    {t("shipsNote")}
                  </p>
                </>
              ) : (
                <>
                  <BuyButtons
                    product={product}
                    labels={{
                      amazon: t("buyAmazon"),
                      noon: t("buyNoon"),
                      soon: t("comingSoon"),
                    }}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-ash-dim">
                    {t("affiliateNote")}
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>

        {/* Pros / Cons / Features */}
        {(l.pros.length > 0 || l.cons.length > 0 || l.features.length > 0) && (
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {l.pros.length > 0 && (
              <Reveal className="rounded-2xl border border-line/70 bg-surface/40 p-6">
                <h2 className="font-display text-lg font-semibold text-chrome">
                  {t("pros")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {l.pros.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-ash">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {l.cons.length > 0 && (
              <Reveal
                delay={0.05}
                className="rounded-2xl border border-line/70 bg-surface/40 p-6"
              >
                <h2 className="font-display text-lg font-semibold text-chrome">
                  {t("cons")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {l.cons.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-ash">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {l.features.length > 0 && (
              <Reveal
                delay={0.1}
                className="rounded-2xl border border-line/70 bg-surface/40 p-6"
              >
                <h2 className="font-display text-lg font-semibold text-chrome">
                  {t("features")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {l.features.map((item) => (
                    <li
                      key={item}
                      className="border-b border-line/50 pb-2.5 text-sm text-ash last:border-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 font-display text-2xl font-semibold text-chrome">
              {t("related")}
            </h2>
            <ProductGrid products={related} locale={locale} />
          </div>
        )}
      </Container>
    </article>
  );
}
