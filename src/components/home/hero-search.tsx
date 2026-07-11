"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Search, ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import type { CategorySlug } from "@/lib/site";

/**
 * Product-first landing hero. Built for ad traffic (mostly mobile): the very
 * first screen shows what the store is, a big search box, and one-tap category
 * shortcuts — so a visitor can reach the product they came for immediately,
 * instead of scrolling through a long cinematic. Search routes to /shop?q= so
 * results open in the full filter/sort browser.
 */
export function HeroSearch({ categories }: { categories: CategorySlug[] }) {
  const t = useTranslations("hero");
  const th = useTranslations("home");
  const tc = useTranslations("categories");
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const trust = [
    { icon: Truck, label: th("heroTrust1") },
    { icon: ShieldCheck, label: th("heroTrust2") },
    { icon: Sparkles, label: th("heroTrust3") },
  ];

  return (
    <section className="relative overflow-hidden bg-ink">
      {/* Ambient gold glow — lightweight, no video, fast first paint */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(212,175,55,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink" />

      <Container className="relative z-10 flex flex-col items-center px-6 pb-14 pt-32 text-center sm:pt-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
          {t("eyebrow")}
        </span>

        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          <span className="text-chrome-gradient">{t("titleLine1")} </span>
          <span className="text-gold-gradient">{t("titleLine2")}</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-ash sm:text-base">{t("subtitle")}</p>

        {/* Search — the primary action */}
        <form onSubmit={submit} className="mt-8 w-full max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-ash-dim ltr:left-5 rtl:right-5" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={th("searchPlaceholder")}
              aria-label={th("searchButton")}
              className="h-14 w-full rounded-full border border-line bg-surface/60 text-base text-chrome placeholder:text-ash-dim backdrop-blur-sm transition-colors focus:border-gold/60 focus:outline-none"
              style={{ paddingInlineStart: "3.25rem", paddingInlineEnd: "8rem" }}
            />
            <button
              type="submit"
              className="absolute top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 ltr:right-2 rtl:left-2"
            >
              {th("searchButton")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </form>

        {/* One-tap category shortcuts */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((slug) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ash transition-colors hover:border-gold/40 hover:text-gold"
            >
              {tc(`${slug}.name`)}
            </Link>
          ))}
          <Link
            href="/shop"
            className="rounded-full border border-gold/40 bg-gold/[0.06] px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/[0.12]"
          >
            {th("shopAll")}
          </Link>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ash-dim">
          {trust.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-gold/70" strokeWidth={1.6} />
              {label}
            </span>
          ))}
        </div>

        {/* Keep the cinematic experience one tap away, not in the way */}
        <Link
          href="/story"
          className="mt-7 text-xs font-medium tracking-wide text-ash-dim underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          {th("storyLink")}
        </Link>
      </Container>
    </section>
  );
}
