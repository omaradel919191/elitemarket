"use client";

import { useEffect, useRef } from "react";
import { heroProgress } from "./progress";

/**
 * Gold-particle explosions layered over the film journey. Each burst is keyed
 * to a scroll position (a product hand-off); particles implode to a bright core
 * at the transition and blast outward as you scroll past — deterministic per
 * scroll value, so it reads the same scrubbing either way. The final burst
 * expands past the viewport so it "fills the whole page" in gold.
 */
type Burst = { tp: number; half: number; maxR: number; n: number };
type Part = { ang: number; sp: number; sz: number };

const BURSTS: Burst[] = [
  { tp: 0.35, half: 0.09, maxR: 0.6, n: 130 }, // watch → perfume
  { tp: 0.65, half: 0.09, maxR: 0.6, n: 130 }, // perfume → sunglasses
  { tp: 0.9, half: 0.12, maxR: 1.5, n: 300 }, // finale — fills the page
];

export function HeroExplosions() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    // Bright gold glow sprite for additive drawing.
    const SPR = 48;
    const sprite = document.createElement("canvas");
    sprite.width = SPR;
    sprite.height = SPR;
    const sc = sprite.getContext("2d")!;
    const g = sc.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
    g.addColorStop(0, "rgba(255,238,190,1)");
    g.addColorStop(0.3, "rgba(232,197,122,0.6)");
    g.addColorStop(1, "rgba(232,197,122,0)");
    sc.fillStyle = g;
    sc.fillRect(0, 0, SPR, SPR);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const parts: Part[][] = BURSTS.map((b) =>
      Array.from({ length: b.n }, () => ({
        ang: rand(0, Math.PI * 2),
        sp: rand(0.3, 1),
        sz: rand(1, 3.2),
      })),
    );

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = true;

    function frame() {
      raf = 0;
      if (!running) return;
      const p = heroProgress.value;
      ctx!.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.46;
      const diag = Math.hypot(w, h);

      ctx!.globalCompositeOperation = "lighter";
      BURSTS.forEach((b, bi) => {
        const local = Math.min(1, Math.abs((p - b.tp) / b.half));
        const alpha = 1 - local; // bright at the transition, gone at the edges
        if (alpha <= 0.002) return;
        const rad = local * b.maxR * diag; // 0 at core → expands outward
        const ps = parts[bi];
        for (const pt of ps) {
          const r = rad * pt.sp;
          const x = cx + Math.cos(pt.ang) * r;
          const y = cy + Math.sin(pt.ang) * r;
          const s = pt.sz * (1 + local * 1.6);
          ctx!.globalAlpha = Math.min(1, alpha * 1.1);
          ctx!.drawImage(sprite, x - s * 3, y - s * 3, s * 6, s * 6);
        }
      });
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      tick();
    }

    function tick() {
      if (running && !raf) raf = requestAnimationFrame(frame);
    }
    tick();

    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting && !document.hidden;
        if (running) tick();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);
    const onVis = () => {
      running = !document.hidden;
      if (running) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[24] h-full w-full"
    />
  );
}
