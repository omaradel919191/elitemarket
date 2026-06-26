import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/catalog";

export function ProductGrid({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  const t = useTranslations();

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-20 text-center">
        <p className="text-ash">{t("common.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <Reveal key={p.slug} delay={(i % 4) * 0.05}>
          <ProductCard
            product={p}
            locale={locale}
            dealLabel={t("shop.deal")}
            categoryName={t(`categories.${p.category}.name`)}
            wishlistLabels={{ add: t("wishlist.add"), remove: t("wishlist.remove") }}
          />
        </Reveal>
      ))}
    </div>
  );
}
