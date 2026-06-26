"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/use-wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  slug,
  labels,
  className,
}: {
  slug: string;
  labels: { add: string; remove: string };
  className?: string;
}) {
  const { has, toggle, ready } = useWishlist();
  const active = ready && has(slug);

  return (
    <button
      type="button"
      aria-label={active ? labels.remove : labels.add}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-300",
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-line/80 bg-black/40 text-ash hover:border-gold/50 hover:text-gold",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-gold")} />
    </button>
  );
}
