import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Rating } from "./rating";
import { WishlistButton } from "./wishlist-button";
import { localized, publicPrice, hasVariants, type Product } from "@/lib/catalog-types";
import { formatAED } from "@/lib/utils";

export function ProductCard({
  product,
  locale,
  dealLabel,
  badgeLabel,
  categoryName,
  wishlistLabels,
}: {
  product: Product;
  locale: string;
  dealLabel: string;
  badgeLabel?: string;
  categoryName: string;
  wishlistLabels: { add: string; remove: string };
}) {
  const l = localized(product, locale);
  const tag = badgeLabel ?? (product.deal ? dealLabel : null);
  const price = publicPrice(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface/40 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/30 hover:bg-surface"
    >
      <div className="relative aspect-square overflow-hidden bg-black">
        <Image
          src={product.image}
          alt={l.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          className="object-contain p-6 transition-transform duration-700 ease-luxe group-hover:scale-105"
        />
        {tag && (
          <span className="absolute top-3 rounded-full bg-gold px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-ink ltr:left-3 rtl:right-3">
            {tag}
          </span>
        )}
        <WishlistButton
          slug={product.slug}
          labels={wishlistLabels}
          className="absolute top-3 ltr:right-3 rtl:left-3"
        />
        <span className="absolute bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-wide text-ash backdrop-blur-sm ltr:left-3 rtl:right-3">
          {categoryName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold">
          {product.brand}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-chrome transition-colors duration-300 group-hover:text-gold">
          {l.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ash">{l.blurb}</p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {product.rating != null && (
              <Rating value={product.rating} className="mb-2" />
            )}
            {price != null ? (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-semibold text-chrome">
                  {formatAED(price, locale)}
                </span>
                {product.deal && product.wasAed != null && !hasVariants(product) && (
                  <span className="text-xs text-ash-dim line-through">
                    {formatAED(product.wasAed, locale)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-gold">
                {locale === "ar" ? "شوف السعر على أمازون" : "See price on Amazon"}
              </span>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-ink">
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </Link>
  );
}
