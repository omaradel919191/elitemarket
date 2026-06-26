"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Rating } from "./rating";
import { useWishlist } from "@/lib/use-wishlist";
import { localized, type Product } from "@/lib/catalog-types";
import { formatAED } from "@/lib/utils";

export function CompareClient({ products: all }: { products: Product[] }) {
  const t = useTranslations("compare");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { slugs, ready } = useWishlist();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const products = slugs
    .map((s) => bySlug.get(s))
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
              {t("title")}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {products.map((p) => {
            const l = localized(p, locale);
            return (
              <div
                key={p.slug}
                className="w-60 shrink-0 rounded-2xl border border-line/70 bg-surface/40 p-4"
              >
                <Link href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
                    <Image
                      src={p.image}
                      alt={l.name}
                      fill
                      sizes="240px"
                      className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 line-clamp-1 font-display text-base font-semibold text-chrome group-hover:text-gold">
                    {l.name}
                  </h3>
                </Link>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ash-dim">
                      {t("price")}
                    </dt>
                    <dd className="mt-0.5 font-display text-lg font-semibold text-chrome">
                      {p.priceAed != null ? formatAED(p.priceAed, locale) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ash-dim">
                      {t("rating")}
                    </dt>
                    <dd className="mt-1">
                      {p.rating != null ? <Rating value={p.rating} /> : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ash-dim">
                      {t("category")}
                    </dt>
                    <dd className="mt-0.5 text-ash">
                      {tc(`${p.category}.name`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ash-dim">
                      {t("bestFor")}
                    </dt>
                    <dd className="mt-0.5 text-ash">{l.bestFor || "—"}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
