"use client";

import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/use-cart";

/** Header cart link with a live item-count badge. */
export function CartButton({ label }: { label: string }) {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-ash transition-colors hover:text-gold"
    >
      <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
      {ready && count > 0 && (
        <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-ink">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
