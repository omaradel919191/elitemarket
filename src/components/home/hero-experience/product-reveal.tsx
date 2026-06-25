"use client";

import { useEffect, useRef } from "react";
import { heroState, band, REVEAL_WINDOWS } from "./progress-store";

/** Photoreal product shots that crystallize from the particle cloud at each
 *  formed moment. Composited with mix-blend: screen so the pure-black plate
 *  vanishes and only the gold-lit product floats in the dark. */
export function ProductReveal() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = heroState.progress;
      REVEAL_WINDOWS.forEach((w, i) => {
        const el = refs.current[i];
        if (!el) return;
        const o = band(p, w.in0, w.in1, w.out0, w.out1);
        el.style.opacity = String(o);
        el.style.transform = `translate(-50%, -50%) scale(${0.9 + o * 0.12})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[12] overflow-hidden"
    >
      {REVEAL_WINDOWS.map((w, i) => (
        <div
          key={w.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] opacity-0"
          style={{ willChange: "opacity, transform" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={w.src}
            alt=""
            className="h-full w-full object-contain"
            style={{
              filter: "brightness(1.18) contrast(1.06) saturate(1.05)",
            }}
            loading="eager"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
