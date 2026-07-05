"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "./product-grid";
import {
  displayPrice,
  isOwn,
  isSoldOut,
  localized,
  type Audience,
  type Product,
} from "@/lib/catalog-types";
import type { CategorySlug } from "@/lib/site";
import { cn } from "@/lib/utils";

type Sort =
  | "featured"
  | "priceAsc"
  | "priceDesc"
  | "rating"
  | "nameAsc"
  | "brandAsc";
type TypeF = "all" | "own" | "affiliate";

type State = {
  q: string;
  cat: string; // category slug, "" = all
  aud: string; // audience, "" = all
  brands: string[];
  min: string;
  max: string;
  sale: boolean;
  inStock: boolean;
  type: TypeF;
  rating: number; // 0 | 3 | 4
  sort: Sort;
};

const EMPTY: State = {
  q: "",
  cat: "",
  aud: "",
  brands: [],
  min: "",
  max: "",
  sale: false,
  inStock: false,
  type: "all",
  rating: 0,
  sort: "featured",
};

const AUDS: Audience[] = ["men", "women", "unisex"];
const SORTS: Sort[] = [
  "featured",
  "priceAsc",
  "priceDesc",
  "rating",
  "nameAsc",
  "brandAsc",
];
const SORT_KEY: Record<Sort, string> = {
  featured: "featured",
  priceAsc: "priceAsc",
  priceDesc: "priceDesc",
  rating: "ratingSort",
  nameAsc: "nameAsc",
  brandAsc: "brandAsc",
};

function readUrl(locked?: CategorySlug): State {
  if (typeof window === "undefined") return { ...EMPTY, cat: locked ?? "" };
  const p = new URLSearchParams(window.location.search);
  const num = (v: string | null) => (v && !Number.isNaN(+v) ? v : "");
  const rating = Number(p.get("rating"));
  const type = p.get("type");
  return {
    q: p.get("q") ?? "",
    cat: locked ?? p.get("cat") ?? "",
    aud: AUDS.includes(p.get("for") as Audience) ? (p.get("for") as string) : "",
    brands: (p.get("brands") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    min: num(p.get("min")),
    max: num(p.get("max")),
    sale: p.get("sale") === "1",
    inStock: p.get("stock") === "1",
    type: type === "own" || type === "affiliate" ? type : "all",
    rating: rating === 3 || rating === 4 ? rating : 0,
    sort: (SORTS.includes(p.get("sort") as Sort) ? p.get("sort") : "featured") as Sort,
  };
}

function writeUrl(s: State, locked?: CategorySlug) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (!locked && s.cat) p.set("cat", s.cat);
  if (s.aud) p.set("for", s.aud);
  if (s.brands.length) p.set("brands", s.brands.join(","));
  if (s.min) p.set("min", s.min);
  if (s.max) p.set("max", s.max);
  if (s.sale) p.set("sale", "1");
  if (s.inStock) p.set("stock", "1");
  if (s.type !== "all") p.set("type", s.type);
  if (s.rating) p.set("rating", String(s.rating));
  if (s.sort !== "featured") p.set("sort", s.sort);
  const qs = p.toString();
  const url = window.location.pathname + (qs ? `?${qs}` : "");
  window.history.replaceState(null, "", url);
}

export function ShopBrowser({
  products,
  locale,
  lockedCategory,
}: {
  products: Product[];
  locale: string;
  /** When set, the browser is scoped to this category and the category picker is hidden. */
  lockedCategory?: CategorySlug;
}) {
  const t = useTranslations("filters");
  const ta = useTranslations("audience");
  const [state, setState] = useState<State>(() => ({
    ...EMPTY,
    cat: lockedCategory ?? "",
  }));
  const [open, setOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [brandsExpanded, setBrandsExpanded] = useState(false);

  // Hydrate from the URL after mount (shareable / back-button friendly) and
  // keep the URL in sync as filters change — without a server round-trip.
  useEffect(() => {
    // One-time hydration from the URL on mount (avoids an SSR/client hydration
    // mismatch from reading window during the initial render). Intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readUrl(lockedCategory));
  }, [lockedCategory]);
  useEffect(() => {
    writeUrl(state, lockedCategory);
  }, [state, lockedCategory]);

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  // Price bounds + brand facet from the full (category-scoped) set.
  const scoped = useMemo(
    () =>
      lockedCategory
        ? products.filter((p) => p.category === lockedCategory)
        : products,
    [products, lockedCategory],
  );

  const brandFacet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of scoped) {
      if (!p.brand) continue;
      counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], locale))
      .map(([name, count]) => ({ name, count }));
  }, [scoped, locale]);

  const filtered = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    const min = state.min ? Number(state.min) : null;
    const max = state.max ? Number(state.max) : null;
    const brandSet = new Set(state.brands);

    const out = scoped.filter((p) => {
      if (!lockedCategory && state.cat && p.category !== state.cat) return false;
      if (state.aud && p.audience !== state.aud) return false;
      if (brandSet.size && !brandSet.has(p.brand)) return false;
      if (state.sale && !p.deal) return false;
      if (state.rating && (p.rating ?? 0) < state.rating) return false;
      if (state.type === "own" && !isOwn(p)) return false;
      if (state.type === "affiliate" && p.source !== "affiliate") return false;
      if (state.inStock && isSoldOut(p)) return false;
      if (min != null || max != null) {
        const price = displayPrice(p);
        if (price == null) return false;
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.nameAr} ${p.brand} ${p.blurb} ${p.blurbAr}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const price = (p: Product) => displayPrice(p);
    const cmpNum = (a: number | null, b: number | null, dir: number) => {
      if (a == null && b == null) return 0;
      if (a == null) return 1; // nulls always last
      if (b == null) return -1;
      return (a - b) * dir;
    };
    const sorted = [...out];
    switch (state.sort) {
      case "priceAsc":
        sorted.sort((a, b) => cmpNum(price(a), price(b), 1));
        break;
      case "priceDesc":
        sorted.sort((a, b) => cmpNum(price(a), price(b), -1));
        break;
      case "rating":
        sorted.sort((a, b) => cmpNum(a.rating ?? null, b.rating ?? null, -1));
        break;
      case "nameAsc":
        sorted.sort((a, b) =>
          localized(a, locale).name.localeCompare(localized(b, locale).name, locale),
        );
        break;
      case "brandAsc":
        sorted.sort((a, b) => a.brand.localeCompare(b.brand, locale));
        break;
      default:
        break; // featured = catalog order
    }
    return sorted;
  }, [scoped, state, locale, lockedCategory]);

  const activeCount =
    (state.aud ? 1 : 0) +
    (state.brands.length ? 1 : 0) +
    (state.min || state.max ? 1 : 0) +
    (state.sale ? 1 : 0) +
    (state.inStock ? 1 : 0) +
    (state.type !== "all" ? 1 : 0) +
    (state.rating ? 1 : 0) +
    (!lockedCategory && state.cat ? 1 : 0);

  const chip =
    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300";
  const on = "border-gold bg-gold/10 text-gold";
  const off = "border-line text-ash hover:border-gold/40 hover:text-chrome";

  const toggleBrand = (name: string) =>
    set(
      "brands",
      state.brands.includes(name)
        ? state.brands.filter((b) => b !== name)
        : [...state.brands, name],
    );

  const visibleBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    const list = q
      ? brandFacet.filter((b) => b.name.toLowerCase().includes(q))
      : brandFacet;
    return brandsExpanded || q ? list : list.slice(0, 8);
  }, [brandFacet, brandQuery, brandsExpanded]);

  const Panel = (
    <div className="space-y-6">
      {/* Audience */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-dim">
          {t("audienceLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set("aud", "")}
            className={cn(chip, !state.aud ? on : off)}
          >
            {ta("all")}
          </button>
          {AUDS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set("aud", state.aud === a ? "" : a)}
              className={cn(chip, state.aud === a ? on : off)}
            >
              {ta(a)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-dim">
          {t("price")}
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={state.min}
            onChange={(e) => set("min", e.target.value)}
            placeholder={t("min")}
            className="w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-chrome outline-none focus:border-gold/50"
          />
          <span className="text-ash-dim">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={state.max}
            onChange={(e) => set("max", e.target.value)}
            placeholder={t("max")}
            className="w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-chrome outline-none focus:border-gold/50"
          />
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-dim">
          {t("rating")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {([0, 3, 4] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set("rating", r)}
              className={cn(chip, state.rating === r ? on : off)}
            >
              {r === 0 ? t("ratingAny") : r === 3 ? t("rating3") : t("rating4")}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Where to buy */}
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-dim">
          {t("type")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(["all", "own", "affiliate"] as const).map((ty) => (
            <button
              key={ty}
              type="button"
              onClick={() => set("type", ty)}
              className={cn(chip, state.type === ty ? on : off)}
            >
              {ty === "all"
                ? t("typeAll")
                : ty === "own"
                  ? t("typeOwn")
                  : t("typeAffiliate")}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Toggles */}
      <div className="flex flex-col gap-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ash">
          <input
            type="checkbox"
            checked={state.sale}
            onChange={(e) => set("sale", e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          {t("sale")}
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ash">
          <input
            type="checkbox"
            checked={state.inStock}
            onChange={(e) => set("inStock", e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          {t("inStock")}
        </label>
      </div>

      {/* Brand */}
      {brandFacet.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-dim">
            {t("brand")}
            {state.brands.length > 0 && (
              <span className="ms-2 text-gold">
                {t("brandsSelected", { count: state.brands.length })}
              </span>
            )}
          </legend>
          {brandFacet.length > 8 && (
            <input
              type="text"
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder={t("brandSearch")}
              className="mb-2 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-chrome outline-none focus:border-gold/50"
            />
          )}
          <div className="max-h-56 space-y-1.5 overflow-y-auto pe-1">
            {visibleBrands.map((b) => (
              <label
                key={b.name}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-ash"
              >
                <input
                  type="checkbox"
                  checked={state.brands.includes(b.name)}
                  onChange={() => toggleBrand(b.name)}
                  className="h-4 w-4 accent-gold"
                />
                <span className="flex-1 truncate">{b.name}</span>
                <span className="text-xs text-ash-dim">{b.count}</span>
              </label>
            ))}
          </div>
          {brandFacet.length > 8 && !brandQuery && (
            <button
              type="button"
              onClick={() => setBrandsExpanded((v) => !v)}
              className="mt-2 text-xs font-medium text-gold hover:underline"
            >
              {brandsExpanded ? t("showLess") : t("showAll", { count: brandFacet.length })}
            </button>
          )}
        </fieldset>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setState({ ...EMPTY, cat: lockedCategory ?? "", sort: state.sort });
            setBrandQuery("");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ash hover:text-gold"
        >
          <X className="h-3.5 w-3.5" />
          {t("clear")}
        </button>
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside
        className={cn(
          "mb-6 rounded-2xl border border-line/70 bg-surface/30 p-5 lg:mb-0 lg:block lg:self-start",
          open ? "block" : "hidden",
        )}
      >
        {Panel}
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={state.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-line bg-surface/40 px-4 py-2.5 text-sm text-chrome outline-none focus:border-gold/50"
            />
          </div>
          <label className="flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-2 text-sm">
            <span className="text-ash-dim">{t("sortLabel")}</span>
            <select
              value={state.sort}
              onChange={(e) => set("sort", e.target.value as Sort)}
              className="bg-transparent text-chrome outline-none"
            >
              {SORTS.map((s) => (
                <option key={s} value={s} className="bg-ink text-chrome">
                  {t(SORT_KEY[s])}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium lg:hidden",
              activeCount ? on : off,
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("toggle")}
            {activeCount > 0 && (
              <span className="rounded-full bg-gold px-1.5 text-xs text-ink">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <p className="mb-5 text-sm text-ash-dim">
          {t("results", { count: filtered.length })}
        </p>

        {filtered.length ? (
          <ProductGrid products={filtered} locale={locale} />
        ) : (
          <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-20 text-center">
            <p className="text-ash">{t("noMatch")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
