"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Monogram } from "@/components/brand/logo";
import {
  SCENES,
  HERO_VH,
  heroProgress,
  band,
  smoothstep,
  veilStrength,
} from "./progress";
import { HeroPoster } from "./fallback";

// When each scene's caption (name + tagline) is on screen.
const CAPTIONS = [
  { i0: 0.08, i1: 0.11, o0: 0.16, o1: 0.2 },
  { i0: 0.24, i1: 0.27, o0: 0.36, o1: 0.4 },
  { i0: 0.44, i1: 0.47, o0: 0.56, o1: 0.6 },
  { i0: 0.64, i1: 0.67, o0: 0.77, o1: 0.82 },
];

export function HeroCinematic() {
  const t = useTranslations("hero");
  const tc = useTranslations("categories");
  const tm = useTranslations("home");

  const [mode, setMode] = useState<"full" | "poster">("poster");
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // width 0 = unknown (hidden tab); treat as desktop. Real phones report a
    // real small width and correctly fall back to the static poster.
    const w = window.innerWidth || 1024;
    if (reduce || w < 768) return;
    setMode("full");
  }, []);

  // Pinned ScrollTrigger writes scroll progress.
  useEffect(() => {
    if (mode !== "full") return;
    let trigger: { kill: () => void } | undefined;
    let killed = false;

    // Dev-only: pin progress via #p=0.4 for deterministic screenshots.
    if (process.env.NODE_ENV !== "production") {
      const m = window.location.hash.match(/p=([0-9.]+)/);
      if (m) {
        heroProgress.value = Math.min(1, Math.max(0, parseFloat(m[1])));
        (window as unknown as { __hp?: typeof heroProgress }).__hp =
          heroProgress;
        return;
      }
    }

    (async () => {
      const [{ ScrollTrigger }, { gsap }] = await Promise.all([
        import("gsap/ScrollTrigger"),
        import("gsap"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      if (killed || !pinRef.current) return;
      trigger = ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          heroProgress.value = self.progress;
        },
      });
      ScrollTrigger.refresh();
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __hp?: typeof heroProgress }).__hp =
          heroProgress;
      }
    })();
    return () => {
      killed = true;
      trigger?.kill();
      heroProgress.value = 0;
    };
  }, [mode]);

  // rAF: crossfade scenes, manage playback, drive overlay copy.
  useEffect(() => {
    if (mode !== "full") return;
    let raf = 0;
    const loop = () => {
      const p = heroProgress.value;

      SCENES.forEach((s, i) => {
        const o = band(p, s.in0, s.in1, s.out0, s.out1);
        const v = videoRefs.current[i];
        if (v) {
          v.style.opacity = String(o);
          v.style.transform = `scale(${1.06 - o * 0.06})`;
          if (o > 0.03) {
            if (v.paused) void v.play().catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        }
        const c = CAPTIONS[i];
        const cap = captionRefs.current[i];
        if (cap) {
          const co = band(p, c.i0, c.i1, c.o0, c.o1);
          cap.style.opacity = String(co);
          cap.style.transform = `translateY(${(1 - co) * 26}px)`;
        }
      });

      if (introRef.current) {
        const o = band(p, 0, 0.015, 0.08, 0.13);
        introRef.current.style.opacity = String(o);
        introRef.current.style.transform = `translateY(${(1 - o) * -24}px)`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(band(p, 0, 0.02, 0.05, 0.11));
      }
      if (veilRef.current) {
        const vs = veilStrength(p);
        veilRef.current.style.opacity = String(vs);
        veilRef.current.style.transform = `scale(${1 + vs * 0.15})`;
      }
      if (finaleRef.current) {
        const o = smoothstep(0.82, 0.93, p);
        finaleRef.current.style.opacity = String(o);
        finaleRef.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
        finaleRef.current.style.transform = `scale(${0.94 + o * 0.06})`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  if (mode === "poster") return <HeroPoster />;

  return (
    <section
      ref={pinRef}
      style={{ height: `${HERO_VH}vh` }}
      className="relative"
      aria-label="Elite Market cinematic product experience"
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-black">
        {/* Product films */}
        {SCENES.map((s, i) => (
          <video
            key={s.key}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-0 will-change-[opacity,transform]"
            src={s.video}
            poster={s.poster}
            muted
            loop
            playsInline
            preload="auto"
          />
        ))}

        {/* Cinematic grading: vignette + warm key */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
        <div className="spotlight pointer-events-none absolute inset-0" />

        {/* Gold-dust transition veil */}
        <div
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(231,199,102,0.5),rgba(212,175,55,0.18)_35%,transparent_70%)]" />
          <div className="grain absolute inset-0 opacity-40 mix-blend-screen" />
        </div>

        {/* Intro headline */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-0 top-[20%] z-20 flex flex-col items-center px-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-1.5 text-[0.7rem] font-medium tracking-wide text-gold backdrop-blur-sm">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)] sm:text-7xl">
            <span className="text-chrome-gradient">{t("titleLine1")}</span>
            <br />
            <span className="text-gold-gradient">{t("titleLine2")}</span>
          </h1>
          <p className="mt-5 max-w-md text-sm text-ash/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Per-scene captions */}
        {SCENES.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              captionRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-x-0 bottom-[12%] z-20 flex flex-col items-center px-6 text-center opacity-0"
          >
            <span className="font-display text-[0.7rem] uppercase tracking-[0.4em] text-gold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 font-display text-4xl font-semibold text-chrome drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:text-6xl">
              {tc(`${s.key}.name`)}
            </h2>
            <p className="mt-2 text-sm tracking-wide text-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {tc(`${s.key}.tagline`)}
            </p>
          </div>
        ))}

        {/* Scroll cue */}
        <div
          ref={cueRef}
          className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-2 text-ash-dim"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.3em]">
            {t("scroll")}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-gold" />
        </div>

        {/* Finale — EM logo + CTA (no orbit) */}
        <div
          ref={finaleRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 opacity-0"
        >
          <div className="glass glow-gold relative mb-8 flex h-28 w-28 items-center justify-center rounded-3xl">
            <div className="sheen absolute inset-0 rounded-3xl" />
            <Monogram className="h-16 w-16" />
          </div>
          <h2 className="max-w-2xl text-center font-display text-3xl font-semibold text-chrome sm:text-5xl">
            {tm("ctaTitle")}
          </h2>
          <p className="mt-4 max-w-md text-center text-ash">{tm("ctaBody")}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" size="lg">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button href="/deals" variant="outline" size="lg">
              {t("ctaSecondary")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
