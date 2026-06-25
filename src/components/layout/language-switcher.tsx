"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const other = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "ع";
  const aria = locale === "ar" ? "Switch to English" : "التبديل الى العربية";

  function switchLocale() {
    startTransition(() => {
      router.replace(pathname, { locale: other });
    });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={aria}
      disabled={pending}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-line px-3 text-sm font-medium text-chrome transition-colors duration-300 hover:border-gold/50 hover:text-gold disabled:opacity-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
