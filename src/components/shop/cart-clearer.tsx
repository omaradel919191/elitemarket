"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/use-cart";

/** Empties the cart once, on mount — used on the order-confirmation page. */
export function CartClearer() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
