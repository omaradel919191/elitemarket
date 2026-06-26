import { ExternalLink } from "lucide-react";
import { getRetailerLink, type Product } from "@/lib/catalog";

/**
 * Retailer buy-buttons. Each links to /go/<slug>?to=<retailer> which appends
 * the affiliate tag and 302s to Amazon/Noon. rel="sponsored" for compliance.
 */
export function BuyButtons({
  product,
  labels,
}: {
  product: Product;
  labels: { amazon: string; noon: string };
}) {
  const amazon = getRetailerLink(product, "amazon");
  const noon = getRetailerLink(product, "noon");

  const cls =
    "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 h-[3.25rem] text-[0.95rem] font-medium tracking-wide transition-all duration-300 ease-luxe";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {amazon && (
        <a
          href={`/go/${product.slug}?to=amazon`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${cls} bg-gradient-to-b from-gold-soft to-gold-deep text-ink shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] hover:-translate-y-0.5`}
        >
          {labels.amazon}
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {noon && (
        <a
          href={`/go/${product.slug}?to=noon`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${cls} border border-gold/35 text-chrome hover:border-gold hover:bg-gold/[0.06] hover:-translate-y-0.5`}
        >
          {labels.noon}
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
