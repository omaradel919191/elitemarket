"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/use-cart";
import { localized, resolveUnit, type Product } from "@/lib/catalog-types";
import { formatAED } from "@/lib/utils";

export function CartClient({
  products,
  locale,
  labels,
}: {
  products: Product[];
  locale: string;
  labels: {
    empty: string;
    browse: string;
    qty: string;
    remove: string;
    subtotal: string;
    shippingNote: string;
    checkout: string;
    redirecting: string;
    setup: string;
    error: string;
    promo: string;
    apply: string;
    discount: string;
    total: string;
  };
}) {
  const { lines, setQty, remove, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discountAed: number; label: string } | null>(null);
  const [codeMsg, setCodeMsg] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = lines
    .map((l) => {
      const product = bySlug.get(l.slug);
      if (!product) return null;
      const unit = resolveUnit(product, l.variantId);
      return { product, variantId: l.variantId, qty: l.qty, unit };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const subtotal = items.reduce((s, x) => s + (x.unit.priceAed ?? 0) * x.qty, 0);
  const discount = applied ? Math.min(applied.discountAed, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const orderLines = () =>
    items.map((x) => ({ slug: x.product.slug, qty: x.qty, variantId: x.variantId }));

  async function applyCode() {
    if (codeBusy || !code.trim()) return;
    setCodeBusy(true);
    setCodeMsg("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lines: orderLines() }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplied({ code: data.code, discountAed: data.discountAed, label: data.label });
        setCodeMsg("");
      } else {
        setApplied(null);
        setCodeMsg(data.error || "Invalid code");
      }
    } catch {
      setCodeMsg("Could not check the code");
    } finally {
      setCodeBusy(false);
    }
  }

  async function checkout() {
    if (busy || items.length === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: orderLines(), locale, code: applied?.code }),
      });
      if (res.status === 503) {
        setMsg(labels.setup);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "failed");
    } catch {
      setMsg(labels.error);
    } finally {
      setBusy(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-20 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-ash-dim" />
        <p className="mt-4 text-ash">{labels.empty}</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/35 px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/[0.06]"
        >
          {labels.browse}
        </Link>
      </div>
    );
  }

  const stepBtn =
    "flex h-9 w-9 items-center justify-center text-ash transition-colors hover:text-gold disabled:opacity-30";

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        {items.map(({ product, variantId, qty, unit }) => {
          const l = localized(product, locale);
          const max = typeof unit.stock === "number" ? unit.stock : 99;
          return (
            <li
              key={`${product.slug}|${variantId ?? ""}`}
              className="flex gap-4 rounded-2xl border border-line/70 bg-surface/40 p-4"
            >
              <Link
                href={`/product/${product.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black"
              >
                <Image src={product.image} alt={l.name} fill sizes="96px" className="object-contain p-2" />
              </Link>
              <div className="flex flex-1 flex-col">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  {product.brand}
                </p>
                <Link
                  href={`/product/${product.slug}`}
                  className="mt-0.5 font-display text-base font-semibold text-chrome hover:text-gold"
                >
                  {l.name}
                </Link>
                {unit.variantName && (
                  <span className="mt-0.5 text-xs text-ash-dim">{unit.variantName}</span>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-line/70">
                    <button
                      type="button"
                      aria-label="−"
                      onClick={() => setQty(product.slug, Math.max(1, qty - 1), variantId)}
                      disabled={qty <= 1}
                      className={stepBtn}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm text-chrome">{qty}</span>
                    <button
                      type="button"
                      aria-label="+"
                      onClick={() => setQty(product.slug, Math.min(max, qty + 1), variantId)}
                      disabled={qty >= max}
                      className={stepBtn}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-base font-semibold text-chrome">
                    {formatAED((unit.priceAed ?? 0) * qty, locale)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label={labels.remove}
                onClick={() => remove(product.slug, variantId)}
                className="self-start text-ash-dim transition-colors hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ash">{labels.subtotal}</span>
            <span className="font-display text-lg font-semibold text-chrome">
              {formatAED(subtotal, locale)}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={labels.promo}
                className="h-10 flex-1 rounded-xl border border-line bg-night/60 px-3 text-sm text-chrome focus:border-gold/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={codeBusy || !code.trim()}
                className="h-10 shrink-0 rounded-xl border border-gold/35 px-4 text-sm text-gold transition-colors hover:bg-gold/[0.06] disabled:opacity-40"
              >
                {labels.apply}
              </button>
            </div>
            {codeMsg && <p className="mt-1.5 text-xs text-danger">{codeMsg}</p>}
          </div>

          {applied && discount > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-success">
                {labels.discount} ({applied.code})
              </span>
              <span className="text-success">−{formatAED(discount, locale)}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-4">
            <span className="text-sm font-medium text-chrome">{labels.total}</span>
            <span className="font-display text-xl font-semibold text-gold">
              {formatAED(total, locale)}
            </span>
          </div>

          <p className="mt-2 text-xs text-ash-dim">{labels.shippingNote}</p>
          <button
            type="button"
            onClick={checkout}
            disabled={busy || items.length === 0}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 h-[3.25rem] text-[0.95rem] font-medium text-ink bg-gradient-to-b from-gold-soft to-gold-deep shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {busy ? labels.redirecting : labels.checkout}
          </button>
          {msg && <p className="mt-3 text-xs text-ash-dim">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
