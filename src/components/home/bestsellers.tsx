import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/shop/product-grid";
import { getOrders } from "@/lib/orders";
import { getProduct } from "@/lib/catalog";
import type { Product } from "@/lib/catalog-types";

/**
 * Bestsellers computed from real (non-cancelled) orders. Hidden until at least
 * two distinct products have sold, so it never shows a half-empty row.
 */
export function Bestsellers({ locale }: { locale: string }) {
  const t = useTranslations("home");

  const counts = new Map<string, number>();
  for (const o of getOrders()) {
    if (o.status === "cancelled") continue;
    for (const it of o.items) counts.set(it.slug, (counts.get(it.slug) ?? 0) + it.qty);
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => getProduct(slug))
    .filter((p): p is Product => !!p)
    .slice(0, 4);

  if (top.length < 2) return null;

  return (
    <section className="relative py-24 sm:py-28">
      <Container>
        <SectionHeading title={t("bestsellersTitle")} subtitle={t("bestsellersSubtitle")} />
        <div className="mt-14">
          <ProductGrid products={top} locale={locale} />
        </div>
      </Container>
    </section>
  );
}
