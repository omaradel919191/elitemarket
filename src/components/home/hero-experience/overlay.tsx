"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Monogram } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/site";
import { heroState, band, smoothstep } from "./progress-store";

const NODE_POS = [
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "top-1/2 ltr:right-0 rtl:left-0 ltr:translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "top-1/2 ltr:left-0 rtl:right-0 ltr:-translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2",
];

const LABELS: {
  key: string;
  idx: string;
  in0: number;
  in1: number;
  out0: number;
  out1: number;
}[] = [
  { key: "watches", idx: "01", in0: 0.07, in1: 0.11, out0: 0.24, out1: 0.3 },
  { key: "perfumes", idx: "02", in0: 0.33, in1: 0.37, out0: 0.46, out1: 0.52 },
  { key: "sunglasses", idx: "03", in0: 0.55, in1: 0.59, out0: 0.68, out1: 0.74 },
  { key: "beauty", idx: "04", in0: 0.77, in1: 0.81, out0: 0.88, out1: 0.93 },
];

export function Overlay() {
  const th = useTranslations("hero");
  const tc = useTranslations("categories");
  const tm = useTranslations("home");

  const introRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = heroState.progress;

      if (introRef.current) {
        const o = band(p, 0, 0.015, 0.05, 0.12);
        introRef.current.style.opacity = String(o);
        introRef.current.style.transform = `translateY(${(1 - o) * -26}px)`;
      }

      LABELS.forEach((l, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const o = band(p, l.in0, l.in1, l.out0, l.out1);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 30}px)`;
      });

      if (finaleRef.current) {
        const o = smoothstep(0.9, 0.975, p);
        finaleRef.current.style.opacity = String(o);
        finaleRef.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
        finaleRef.current.style.transform = `scale(${0.94 + o * 0.06})`;
      }

      if (railRef.current) {
        railRef.current.style.opacity = String(band(p, 0.1, 0.16, 0.86, 0.92));
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const railStops = [
    { key: "watches" },
    { key: "perfumes" },
    { key: "sunglasses" },
    { key: "beauty" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Scene 1 — cinematic entry */}
      <div
        ref={introRef}
        className="absolute inset-x-0 top-[16%] flex flex-col items-center px-6 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.05] px-4 py-1.5 text-[0.7rem] font-medium tracking-wide text-gold">
          {th("eyebrow")}
        </span>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] sm:text-7xl">
          <span className="text-chrome-gradient">{th("titleLine1")}</span>
          <br />
          <span className="text-gold-gradient">{th("titleLine2")}</span>
        </h1>
        <p className="mt-5 max-w-md text-sm text-ash">{th("subtitle")}</p>
        <span className="mt-10 inline-flex flex-col items-center gap-2 text-[0.62rem] uppercase tracking-[0.3em] text-ash-dim">
          {th("scroll")}
          <ChevronDown className="h-4 w-4 animate-bounce text-gold" />
        </span>
      </div>

      {/* Scenes 2–5 — product labels */}
      {LABELS.map((l, i) => (
        <div
          key={l.key}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="absolute inset-x-0 bottom-[12%] flex flex-col items-center px-6 text-center opacity-0"
          style={{ willChange: "opacity, transform" }}
        >
          <span className="font-display text-[5rem] font-semibold leading-none text-gold/15 sm:text-[7rem]">
            {l.idx}
          </span>
          <h2 className="-mt-4 font-display text-4xl font-semibold text-chrome sm:text-6xl">
            {tc(`${l.key}.name`)}
          </h2>
          <p className="mt-3 text-sm tracking-wide text-gold">
            {tc(`${l.key}.tagline`)}
          </p>
        </div>
      ))}

      {/* Progress rail */}
      <div
        ref={railRef}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-5 opacity-0"
      >
        {railStops.map((s) => (
          <span
            key={s.key}
            className="text-[0.6rem] uppercase tracking-[0.2em] text-ash-dim"
          >
            {tc(`${s.key}.name`)}
          </span>
        ))}
      </div>

      {/* Scene 6 — Elite Market universe (final destination) */}
      <div
        ref={finaleRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          {th("eyebrow")}
        </p>
        <h2 className="mt-4 text-center font-display text-3xl font-semibold text-chrome sm:text-5xl">
          {tm("categoriesTitle")}
        </h2>

        <div className="relative my-10 aspect-square w-[18rem] sm:w-[24rem]">
          <div className="absolute inset-[12%] rounded-full border border-dashed border-gold/20" />
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.slug}
                className={`absolute ${NODE_POS[i]}`}
              >
                <div className="float-slow flex flex-col items-center" style={{ animationDelay: `${i * 0.6}s` }}>
                  <div className="glass glow-gold flex h-16 w-16 items-center justify-center rounded-full">
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <span className="mt-2 text-[0.7rem] text-ash">
                    {tc(`${c.slug}.name`)}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="glass glow-gold flex h-24 w-24 items-center justify-center rounded-full">
              <Monogram className="h-14 w-14" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href="/shop" size="lg">
            {th("ctaPrimary")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button href="/deals" variant="outline" size="lg">
            {th("ctaSecondary")}
          </Button>
        </div>
      </div>
    </div>
  );
}
