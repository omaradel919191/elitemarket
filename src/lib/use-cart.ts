"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-only cart persisted to localStorage. Holds only OUR OWN products
 * (affiliate items link out and never enter the cart). Stores slug + optional
 * variantId + qty; the server re-prices from the catalog at checkout so the
 * client can never set a price. A custom event keeps header badge, cart page and
 * buttons in sync. A line is keyed by slug + variantId so different sizes of the
 * same product are separate lines.
 */

const KEY = "em_cart";
const EVT = "em-cart-change";

export type CartLine = { slug: string; variantId?: string; qty: number };

function lineKey(slug: string, variantId?: string) {
  return `${slug}|${variantId ?? ""}`;
}

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return parsed.filter(
      (l) => l && typeof l.slug === "string" && Number(l.qty) > 0,
    );
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVT));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
    const sync = () => setLines(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((slug: string, qty = 1, variantId?: string) => {
    const cur = read();
    const found = cur.find((l) => lineKey(l.slug, l.variantId) === lineKey(slug, variantId));
    if (found) found.qty = Math.min(99, found.qty + qty);
    else cur.push({ slug, variantId, qty: Math.min(99, Math.max(1, qty)) });
    write(cur);
  }, []);

  const setQty = useCallback((slug: string, qty: number, variantId?: string) => {
    const cur = read().filter(
      (l) => lineKey(l.slug, l.variantId) !== lineKey(slug, variantId),
    );
    if (qty > 0) cur.push({ slug, variantId, qty: Math.min(99, qty) });
    write(cur);
  }, []);

  const remove = useCallback((slug: string, variantId?: string) => {
    write(read().filter((l) => lineKey(l.slug, l.variantId) !== lineKey(slug, variantId)));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((n, l) => n + l.qty, 0);

  return { lines, count, add, setQty, remove, clear, ready };
}
