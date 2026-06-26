"use client";

import { useLocale, useTranslations } from "next-intl";
import { GitCompareArrows } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./product-grid";
import { useWishlist } from "@/lib/use-wishlist";
import { getProduct, type Product } from "@/lib/catalog";

export function WishlistClient() {
  const t = useTranslations("wishlist");
  const tcompare = useTranslations("compare");
  const locale = useLocale();
  const { slugs, clear, ready } = useWishlist();
  const products = slugs
    .map(getProduct)
    .filter((p): p is Product => Boolean(p));

  if (!ready) {
    return (
      <Container>
        <div className="h-40" />
      </Container>
    );
  }

  if (!products.length) {
    return (
      <Container>
        <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-20 text-center">
          <p className="text-ash">{t("empty")}</p>
          <div className="mt-6 flex justify-center">
            <Button href="/shop" variant="outline">
              {t("browse")}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
        >
          <GitCompareArrows className="h-4 w-4" />
          {tcompare("title")}
        </Link>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-ash-dim transition-colors hover:text-danger"
        >
          {t("clear")}
        </button>
      </div>
      <ProductGrid products={products} locale={locale} />
    </Container>
  );
}
