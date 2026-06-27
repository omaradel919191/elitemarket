import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { CartClient } from "@/components/shop/cart-client";
import { getAllProducts, isOwn } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const products = getAllProducts().filter(isOwn);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <section className="pb-28">
        <Container>
          <CartClient
            products={products}
            locale={locale}
            labels={{
              empty: t("empty"),
              browse: t("browse"),
              qty: t("qty"),
              remove: t("remove"),
              subtotal: t("subtotal"),
              shippingNote: t("shippingNote"),
              checkout: t("checkout"),
              redirecting: t("redirecting"),
              setup: t("setup"),
              error: t("error"),
              promo: t("promo"),
              apply: t("apply"),
              discount: t("discount"),
              total: t("total"),
              crossSell: t("crossSell"),
            }}
          />
        </Container>
      </section>
    </>
  );
}
