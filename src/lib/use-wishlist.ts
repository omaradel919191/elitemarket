"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-only wishlist persisted to localStorage (slugs). No accounts, no
 * server — fits the affiliate model. A custom event keeps all mounted
 * instances (header, cards, wishlist page) in sync within the tab.
 */

const KEY = "em_wishlist";
const EVT = "em-wishlist-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(EVT));
}

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlugs(read());
    setReady(true);
    const sync = () => setSlugs(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const clear = useCallback(() => write([]), []);

  return { slugs, has, toggle, clear, ready };
}
