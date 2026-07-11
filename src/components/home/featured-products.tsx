import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/shop/product-grid";
import { getAllProducts } from "@/lib/catalog";

/**
 * "Editor's Selection" on the home page — surfaces real products so visitors see
 * the catalogue immediately. Prioritises deals + badged picks, then fills with
 * the rest. Hidden when there are no products.
 */
export function FeaturedProducts({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const all = getAllProducts();
  if (all.length === 0) return null;

  const deals = all.filter((p) => p.deal);
  const badged = all.filter((p) => p.badge && !p.deal);
  const rest = all.filter((p) => !p.deal && !p.badge);
  const featured = [...deals, ...badged, ...rest].slice(0, 8);

  return (
    <section className="relative py-24 sm:py-28">
      <Container>
        <SectionHeading title={t("popularTitle")} subtitle={t("popularSubtitle")} />
        <div className="mt-14">
          <ProductGrid products={featured} locale={locale} />
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/35 px-7 py-3.5 text-sm font-medium text-gold transition-colors hover:bg-gold/[0.06]"
          >
            {t("ctaButton")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
