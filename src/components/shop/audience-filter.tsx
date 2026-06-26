import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Audience } from "@/lib/catalog-types";
import type { CategorySlug } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Men / Women / Unisex sub-filter under a category. Only audiences that actually
 * have products in this category are rendered — an empty one never shows. The
 * selection is carried in the `for` query param so pages stay shareable.
 */
export function AudienceFilter({
  category,
  audiences,
  active,
}: {
  category: CategorySlug;
  audiences: Audience[];
  active?: Audience;
}) {
  const t = useTranslations("audience");

  // Nothing to choose between (0 or 1 audience) → don't clutter the page.
  if (audiences.length < 2) return null;

  const chip =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300";
  const on = "bg-gold text-ink";
  const off = "text-ash hover:text-chrome";

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line/70 bg-surface/40 p-1">
      <Link
        href={`/category/${category}`}
        className={cn(chip, !active ? on : off)}
      >
        {t("all")}
      </Link>
      {audiences.map((a) => (
        <Link
          key={a}
          href={`/category/${category}?for=${a}`}
          className={cn(chip, active === a ? on : off)}
        >
          {t(a)}
        </Link>
      ))}
    </div>
  );
}
