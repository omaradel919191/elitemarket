import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategorySlug } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Category chips. Only the categories passed in are shown, so an empty category
 * never appears. `active` highlights the current one ("All" when undefined).
 */
export function CategoryFilter({
  categories,
  active,
}: {
  categories: CategorySlug[];
  active?: string;
}) {
  const t = useTranslations();
  const chip =
    "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300";
  const on = "border-gold bg-gold/10 text-gold";
  const off = "border-line text-ash hover:border-gold/40 hover:text-chrome";

  return (
    <div className="flex flex-wrap gap-2.5">
      <Link href="/shop" className={cn(chip, !active ? on : off)}>
        {t("shop.all")}
      </Link>
      {categories.map((slug) => (
        <Link
          key={slug}
          href={`/category/${slug}`}
          className={cn(chip, active === slug ? on : off)}
        >
          {t(`categories.${slug}.name`)}
        </Link>
      ))}
    </div>
  );
}
