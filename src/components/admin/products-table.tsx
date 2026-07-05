"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Pencil, ArrowUp, ArrowDown, X } from "lucide-react";
import type { Product } from "@/lib/catalog-types";
import { formatAED } from "@/lib/utils";

type SortKey =
  | "name"
  | "brand"
  | "category"
  | "type"
  | "audience"
  | "price"
  | "stock"
  | "deal";

const numOrInf = (v: number | null | undefined) =>
  typeof v === "number" ? v : Number.POSITIVE_INFINITY;

function SortHeader({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: 1 | -1 } | null;
  onSort: (k: SortKey) => void;
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(k)}
        className="inline-flex items-center gap-1 hover:text-gold"
      >
        {label}
        {sort?.key === k &&
          (sort.dir === 1 ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          ))}
      </button>
    </th>
  );
}

export function AdminProductsTable({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [type, setType] = useState("");
  const [aud, setAud] = useState("");
  const [deal, setDeal] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (type && p.source !== type) return false;
      if (aud && p.audience !== aud) return false;
      if (deal === "yes" && !p.deal) return false;
      if (deal === "no" && p.deal) return false;
      if (query) {
        const hay = `${p.name} ${p.nameAr} ${p.brand} ${p.slug}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    if (sort) {
      const { key, dir } = sort;
      const cmp = (a: Product, b: Product): number => {
        switch (key) {
          case "price":
            return (numOrInf(a.priceAed) - numOrInf(b.priceAed)) * dir;
          case "stock":
            return (numOrInf(a.stock) - numOrInf(b.stock)) * dir;
          case "deal":
            return ((a.deal ? 1 : 0) - (b.deal ? 1 : 0)) * dir;
          case "type":
            return a.source.localeCompare(b.source) * dir;
          case "category":
            return a.category.localeCompare(b.category) * dir;
          case "audience":
            return a.audience.localeCompare(b.audience) * dir;
          case "brand":
            return a.brand.localeCompare(b.brand) * dir;
          default:
            return a.name.localeCompare(b.name) * dir;
        }
      };
      out = [...out].sort(cmp);
    }
    return out;
  }, [products, q, cat, type, aud, deal, sort]);

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s?.key === key
        ? s.dir === 1
          ? { key, dir: -1 }
          : null // third click clears back to catalog order
        : { key, dir: 1 },
    );

  const active = q || cat || type || aud || deal;
  const clear = () => {
    setQ("");
    setCat("");
    setType("");
    setAud("");
    setDeal("");
  };

  const selectCls =
    "rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-chrome outline-none focus:border-gold/50";

  return (
    <>
      {/* Filter toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, brand or slug…"
          className="min-w-[12rem] flex-1 rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-chrome outline-none focus:border-gold/50"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c} className="bg-ink capitalize">
              {c}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
          <option value="">All types</option>
          <option value="own" className="bg-ink">Own</option>
          <option value="affiliate" className="bg-ink">Affiliate</option>
        </select>
        <select value={aud} onChange={(e) => setAud(e.target.value)} className={selectCls}>
          <option value="">All audiences</option>
          <option value="men" className="bg-ink">Men</option>
          <option value="women" className="bg-ink">Women</option>
          <option value="unisex" className="bg-ink">Unisex</option>
        </select>
        <select value={deal} onChange={(e) => setDeal(e.target.value)} className={selectCls}>
          <option value="">Deal: any</option>
          <option value="yes" className="bg-ink">On deal</option>
          <option value="no" className="bg-ink">No deal</option>
        </select>
        {active && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-sm text-ash hover:text-gold"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-ash-dim">
        {rows.length} of {products.length} products
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line/70">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-ash-dim">
              <SortHeader label="Product" k="name" sort={sort} onSort={onSort} />
              <SortHeader label="Category" k="category" sort={sort} onSort={onSort} />
              <SortHeader label="Type" k="type" sort={sort} onSort={onSort} />
              <SortHeader label="Audience" k="audience" sort={sort} onSort={onSort} />
              <SortHeader label="Price" k="price" sort={sort} onSort={onSort} />
              <SortHeader label="Stock" k="stock" sort={sort} onSort={onSort} />
              <SortHeader label="Deal" k="deal" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.slug}
                className="border-b border-line/50 last:border-0 hover:bg-surface/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span>
                      <span className="block font-medium text-chrome">{p.name}</span>
                      <span className="block text-xs text-ash-dim">{p.brand}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-ash">{p.category}</td>
                <td className="px-4 py-3">
                  {p.source === "own" ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                      Own
                    </span>
                  ) : (
                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs text-ash-dim">
                      Affiliate
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize text-ash">{p.audience}</td>
                <td className="px-4 py-3 text-ash">
                  {p.priceAed != null ? formatAED(p.priceAed) : "—"}
                </td>
                <td className="px-4 py-3 text-ash">
                  {p.source === "own"
                    ? typeof p.stock === "number"
                      ? p.stock
                      : "∞"
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.deal ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                      Deal
                    </span>
                  ) : (
                    <span className="text-ash-dim">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <a
                      href={`/admin/products/${p.slug}/edit`}
                      className="inline-flex items-center gap-1 text-gold hover:text-gold-soft"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </a>
                    <a
                      href={`/en/product/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ash hover:text-chrome"
                    >
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-ash">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
