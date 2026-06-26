import { ExternalLink, Clock } from "lucide-react";
import { getRetailerLink, type Product } from "@/lib/catalog-types";

/**
 * Retailer buy-buttons. Renders a live affiliate button only when a retailer
 * URL is present; missing URLs show a disabled "coming soon" state instead of
 * opening a wrong link. Live links go through /go/<slug>?to=<retailer> which
 * appends the affiliate tag. rel="sponsored" for compliance.
 */
export function BuyButtons({
  product,
  labels,
}: {
  product: Product;
  labels: { amazon: string; noon: string; soon: string };
}) {
  const amazon = getRetailerLink(product, "amazon");
  const noon = getRetailerLink(product, "noon");
  const amazonLive = !!amazon?.url.trim();
  const noonLive = !!noon?.url.trim();

  const base =
    "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 h-[3.25rem] text-[0.95rem] font-medium tracking-wide transition-all duration-300 ease-luxe";

  // No live links anywhere → single clear coming-soon notice.
  if (!amazonLive && !noonLive) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full border border-line/70 bg-surface/40 px-6 py-4 text-sm text-ash-dim">
        <Clock className="h-4 w-4" />
        {labels.soon}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {amazonLive && (
        <a
          href={`/go/${product.slug}?to=amazon`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${base} bg-gradient-to-b from-gold-soft to-gold-deep text-ink shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] hover:-translate-y-0.5`}
        >
          {labels.amazon}
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {noonLive && (
        <a
          href={`/go/${product.slug}?to=noon`}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${base} border border-gold/35 text-chrome hover:border-gold hover:bg-gold/[0.06] hover:-translate-y-0.5`}
        >
          {labels.noon}
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
