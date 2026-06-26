"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "./product-grid";
import { searchProducts } from "@/lib/catalog";

export function SearchClient() {
  const t = useTranslations("search");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProducts(q), [q]);
  const trimmed = q.trim();

  return (
    <Container>
      <div className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-ash-dim ltr:left-4 rtl:right-4" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("title")}
          className="h-14 w-full rounded-full border border-line bg-surface/50 text-base text-chrome placeholder:text-ash-dim transition-colors focus:border-gold/50 focus:outline-none ltr:pl-12 ltr:pr-5 rtl:pr-12 rtl:pl-5"
        />
      </div>

      <p className="mt-6 text-sm text-ash-dim">
        {trimmed
          ? t("results", { count: results.length, query: trimmed })
          : t("prompt")}
      </p>

      {trimmed && results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line/70 bg-surface/30 px-6 py-16 text-center">
          <p className="text-ash">{t("empty", { query: trimmed })}</p>
        </div>
      ) : (
        trimmed.length > 0 && (
          <div className="mt-8">
            <ProductGrid products={results} locale={locale} />
          </div>
        )
      )}
    </Container>
  );
}
