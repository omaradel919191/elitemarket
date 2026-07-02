"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIPS, HERO_VH, heroProgress, band, smoothstep, clamp01 } from "./progress";
import { HeroPoster } from "./fallback";

export function HeroCinematic() {
  const t = useTranslations("hero");
  const tc = useTranslations("categories");
  const tm = useTranslations("home");

  const [mode, setMode] = useState<"full" | "video" | "static">("static");
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const captionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const introRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const filmsRef = useRef<HTMLDivElement>(null);
  // Smoothed pointer offset from centre, in [-1, 1], for the 3D tilt.
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Pointer drives a subtle 3D parallax tilt on the film stage.
  useEffect(() => {
    if (mode !== "full") return;
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = window.innerWidth || 1024;
    if (reduce) return; // reduced motion → keep the static poster
    // Mobile gets a lightweight autoplay video; desktop the full cinematic.
    // One-time client feature-detection on mount — intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(w < 768 ? "video" : "full");
  }, []);

  // Pinned ScrollTrigger writes scroll progress.
  useEffect(() => {
    if (mode !== "full") return;
    let trigger: { kill: () => void } | undefined;
    let killed = false;

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
        // Smoothed scrub (~0.8s catch-up) so scroll changes ease into the
        // clip crossfades instead of snapping — this is what removes the
        // video-decode "skip" you get with scrub:true.
        scrub: 0.8,
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

  // rAF: crossfade clips, manage playback, drive overlay copy.
  useEffect(() => {
    if (mode !== "full") return;
    let raf = 0;
    const loop = () => {
      const p = heroProgress.value;

      // Ease the pointer toward its target and tilt the whole film stage in 3D.
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.06;
      m.y += (m.ty - m.y) * 0.06;
      if (filmsRef.current) {
        filmsRef.current.style.transform = `rotateY(${m.x * 4}deg) rotateX(${
          -m.y * 3
        }deg) scale(1.06)`;
      }

      CLIPS.forEach((c, i) => {
        const o = band(p, c.in0, c.in1, c.out0, c.out1);
        const v = videoRefs.current[i];
        if (v) {
          v.style.opacity = String(o);
          // Slow cinematic dolly across each clip's life adds real depth.
          const lp = clamp01((p - c.in0) / (c.out1 - c.in0));
          const scale = 1.16 - lp * 0.2;
          v.style.transform = `translate3d(${(lp - 0.5) * 44}px, ${
            (lp - 0.5) * -18
          }px, 0) scale(${scale})`;
          if (o > 0.03) {
            if (v.paused) void v.play().catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        }
        if (c.caption) {
          const cap = captionRefs.current[c.key];
          if (cap) {
            const co = band(p, c.in1, c.in1 + 0.03, c.out0 - 0.03, c.out0);
            cap.style.opacity = String(co);
            cap.style.transform = `translateY(${(1 - co) * 40}px) scale(${
              0.9 + co * 0.1
            })`;
          }
        }
      });

      if (introRef.current) {
        const o = band(p, 0, 0.015, 0.07, 0.11);
        introRef.current.style.opacity = String(o);
        introRef.current.style.transform = `translateY(${(1 - o) * -22}px)`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(band(p, 0, 0.02, 0.05, 0.1));
      }
      if (finaleRef.current) {
        const o = smoothstep(0.86, 0.95, p);
        finaleRef.current.style.opacity = String(o);
        finaleRef.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
        finaleRef.current.style.transform = `scale(${0.94 + o * 0.06})`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  if (mode !== "full") return <HeroPoster video={mode === "video"} />;

  const products = CLIPS.filter((c) => c.caption);

  return (
    <section
      ref={pinRef}
      style={{ height: `${HERO_VH}vh` }}
      className="relative"
      aria-label="Elite Market cinematic product experience"
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-black [perspective:1400px]">
        {/* Films: products with a 3D dolly + pointer-tilt stage */}
        <div
          ref={filmsRef}
          className="absolute inset-0 [transform-style:preserve-3d] will-change-transform"
        >
          {CLIPS.map((c, i) => (
            <video
              key={c.key}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover opacity-0 [will-change:opacity,transform]"
              src={c.video}
              poster={c.poster}
              muted
              loop
              playsInline
              preload={i < 2 ? "auto" : "metadata"}
            />
          ))}
        </div>

        {/* Cinematic grading */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_45%,transparent_45%,rgba(0,0,0,0.6)_100%)]" />

        {/* Intro headline */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-0 top-[18%] z-20 flex flex-col items-center px-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-1.5 text-[0.7rem] font-medium tracking-wide text-gold backdrop-blur-sm">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] sm:text-7xl">
            <span className="text-chrome-gradient">{t("titleLine1")}</span>
            <br />
            <span className="text-gold-gradient">{t("titleLine2")}</span>
          </h1>
          <p className="mt-5 max-w-md text-sm text-ash/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Per-product captions */}
        {products.map((c) => (
          <div
            key={c.key}
            ref={(el) => {
              captionRefs.current[c.key] = el;
            }}
            className="pointer-events-none absolute inset-x-0 bottom-[11%] z-20 flex flex-col items-center px-6 text-center opacity-0"
          >
            <h2 className="font-display text-4xl font-semibold text-chrome drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-6xl">
              {tc(`${c.caption}.name`)}
            </h2>
            <p className="mt-2 text-sm tracking-wide text-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {tc(`${c.caption}.tagline`)}
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

        {/* Finale — the video resolves into the EM emblem; overlay adds the CTA */}
        <div
          ref={finaleRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-end px-6 pb-[7%] opacity-0"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <h2 className="relative max-w-2xl text-center font-display text-3xl font-semibold text-chrome sm:text-5xl">
            {tm("ctaTitle")}
          </h2>
          <p className="relative mt-4 max-w-md text-center text-ash">
            {tm("ctaBody")}
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
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
