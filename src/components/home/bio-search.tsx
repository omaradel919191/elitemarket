"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

/**
 * Compact search box for the link-in-bio page. Routes to /shop?q= so results
 * open in the full filter/sort browser.
 */
export function BioSearch() {
  const t = useTranslations("links");
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <form onSubmit={submit} className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-ash-dim ltr:left-4 rtl:right-4" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="h-13 w-full rounded-full border border-line bg-surface/60 text-base text-chrome placeholder:text-ash-dim transition-colors focus:border-gold/60 focus:outline-none"
        style={{ height: "3.25rem", paddingInlineStart: "3rem", paddingInlineEnd: "3.5rem" }}
      />
      <button
        type="submit"
        aria-label={t("searchPlaceholder")}
        className="absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-gold-soft to-gold-deep text-ink transition-opacity hover:opacity-90 ltr:right-1.5 rtl:left-1.5"
      >
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </form>
  );
}
