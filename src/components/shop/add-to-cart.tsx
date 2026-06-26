"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/use-cart";
import { isSoldOut, type Product } from "@/lib/catalog-types";

/**
 * Buy controls for OUR OWN products: quantity stepper + Add to cart + Buy now.
 * Affiliate products never render this (they use BuyButtons instead).
 */
export function AddToCart({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: string;
  labels: {
    add: string;
    added: string;
    buyNow: string;
    soldOut: string;
    setup: string;
  };
}) {
  const { add, ready } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const soldOut = isSoldOut(product);
  const max = typeof product.stock === "number" ? product.stock : 99;

  function addToCart() {
    add(product.slug, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  async function buyNow() {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: [{ slug: product.slug, qty }], locale }),
      });
      if (res.status === 503) {
        // Payment not configured yet — drop into the cart instead of failing.
        add(product.slug, qty);
        setMsg(labels.setup);
        router.push(`/${locale}/cart`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "checkout failed");
    } catch {
      add(product.slug, qty);
      router.push(`/${locale}/cart`);
    } finally {
      setBusy(false);
    }
  }

  if (soldOut) {
    return (
      <div className="flex items-center justify-center rounded-full border border-line/70 bg-surface/40 px-6 py-4 text-sm font-medium text-ash-dim">
        {labels.soldOut}
      </div>
    );
  }

  const stepBtn =
    "flex h-11 w-11 items-center justify-center text-ash transition-colors hover:text-gold disabled:opacity-30";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="inline-flex shrink-0 items-center rounded-full border border-line/70 bg-surface/40">
          <button
            type="button"
            aria-label="−"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className={stepBtn}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium text-chrome">
            {qty}
          </span>
          <button
            type="button"
            aria-label="+"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            className={stepBtn}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={!ready}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/35 px-6 h-[3.25rem] text-[0.95rem] font-medium tracking-wide text-chrome transition-all duration-300 ease-luxe hover:border-gold hover:bg-gold/[0.06] hover:-translate-y-0.5"
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4 text-gold" />
              {labels.added}
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {labels.add}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 h-[3.25rem] text-[0.95rem] font-medium tracking-wide text-ink bg-gradient-to-b from-gold-soft to-gold-deep shadow-[0_12px_34px_-12px_rgba(212,175,55,0.65)] transition-transform duration-300 ease-luxe hover:-translate-y-0.5 disabled:opacity-50"
        >
          {labels.buyNow}
        </button>
      </div>
      {msg && <p className="mt-3 text-xs text-ash-dim">{msg}</p>}
    </div>
  );
}
