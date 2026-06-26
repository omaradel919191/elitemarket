import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORIES } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CategoryFilter({ active }: { active?: string }) {
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
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className={cn(chip, active === c.slug ? on : off)}
        >
          {t(`categories.${c.slug}.name`)}
        </Link>
      ))}
    </div>
  );
}
