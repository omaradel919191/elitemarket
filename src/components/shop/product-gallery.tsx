"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product image gallery: a large active image + a thumbnail strip. Falls back to
 * a single image when there's only one. Client-side so thumbnails can swap the
 * active image without navigation.
 */
export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["/brand/products/perfume.png"];
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line/70 bg-black">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-10"
        />
        {badge && (
          <span className="absolute top-5 rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink ltr:left-5 rtl:right-5">
            {badge}
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-black transition-colors",
                i === active
                  ? "border-gold"
                  : "border-line/70 hover:border-gold/40",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
