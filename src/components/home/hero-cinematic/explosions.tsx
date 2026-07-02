"use client";

import { useEffect, useRef } from "react";
import { heroProgress } from "./progress";

/**
 * Product-dissolve transitions. Each product's poster is sampled into ~1200
 * gold-tinted particles; at a hand-off the current product shatters into those
 * particles, they blast outward (peak at the mid-scroll), then converge into
 * the next product's particle shape before the next film fades in. The finale
 * disperses the last product to the page edges. Deterministic per scroll value
 * so it scrubs cleanly both ways; runs only on the desktop cinematic hero.
 */
const GOLD = [235, 200, 130];
const CAP = 1200;

type Sample = { x: number; y: number; r: number; g: number; b: number };
type Pt = {
  ax: number; ay: number; bx: number; by: number;
  dx: number; dy: number; r: number; g: number; b: number; sz: number;
};
type Trans = { tp: number; half: number; disperse: boolean; pts: Pt[] };

const IMAGES = [
  "/brand/products/watch.png",
  "/brand/products/perfume.png",
  "/brand/products/sunglasses.png",
];
const DEFS = [
  { tp: 0.35, half: 0.075, src: 0, dst: 1 as number | null },
  { tp: 0.65, half: 0.075, src: 1, dst: 2 as number | null },
  { tp: 0.9, half: 0.1, src: 2, dst: null as number | null },
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
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    let w = 0;
    let h = 0;
    let transitions: Trans[] = [];
    let cancelled = false;
    let raf = 0;
    let running = true;

    function loadSamples(url: string): Promise<Sample[]> {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => {
          const S = 150;
          const c = document.createElement("canvas");
          c.width = S;
          c.height = S;
          const x = c.getContext("2d")!;
          const ar = img.width / img.height;
          let dw = S;
          let dh = S;
          if (ar > 1) dh = S / ar;
          else dw = S * ar;
          x.drawImage(img, (S - dw) / 2, (S - dh) / 2, dw, dh);
          const data = x.getImageData(0, 0, S, S).data;
          const pts: Sample[] = [];
          for (let yy = 0; yy < S; yy += 2) {
            for (let xx = 0; xx < S; xx += 2) {
              const i = (yy * S + xx) * 4;
              if (data[i + 3] < 40) continue;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              if (r + g + b < 45) continue; // skip near-black background
              pts.push({ x: xx / S - 0.5, y: yy / S - 0.5, r, g, b });
            }
          }
          for (let i = pts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pts[i], pts[j]] = [pts[j], pts[i]];
          }
          res(pts);
        };
        img.onerror = () => res([]);
        img.src = url;
      });
    }

    Promise.all(IMAGES.map(loadSamples)).then((s) => {
      if (cancelled) return;
      transitions = DEFS.map((d) => {
        const A = s[d.src];
        const B = d.dst != null ? s[d.dst] : A;
        const n = Math.min(CAP, A.length, B.length);
        const pts: Pt[] = [];
        for (let i = 0; i < n; i++) {
          const a = A[i];
          const b = B[i];
          const ang = rand(0, Math.PI * 2);
          const mag = rand(0.35, 1) * (d.dst == null ? 2.6 : 1);
          pts.push({
            ax: a.x, ay: a.y, bx: b.x, by: b.y,
            dx: Math.cos(ang) * mag, dy: Math.sin(ang) * mag,
            r: (a.r + GOLD[0]) / 2, g: (a.g + GOLD[1]) / 2, b: (a.b + GOLD[2]) / 2,
            sz: rand(1, 2.4),
          });
        }
        return { tp: d.tp, half: d.half, disperse: d.dst == null, pts };
      });
      tick();
    });

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      raf = 0;
      if (!running) return;
      const p = heroProgress.value;
      ctx!.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.46;
      const size = Math.min(w, h) * 0.92;
      const K = Math.min(w, h);

      ctx!.globalCompositeOperation = "lighter";
      for (const tr of transitions) {
        const d = (p - tr.tp) / tr.half;
        if (d <= -1 || d >= 1) continue;
        const t = (d + 1) / 2; // 0 → 1 through the hand-off
        const burst = Math.sin(t * Math.PI); // 0 at ends, 1 mid
        const vis = Math.min(1, burst * 1.7 + 0.12);
        for (const pt of tr.pts) {
          const bx = tr.disperse ? pt.ax + pt.dx * 2.2 : pt.bx;
          const by = tr.disperse ? pt.ay + pt.dy * 2.2 : pt.by;
          const lx = pt.ax + (bx - pt.ax) * t;
          const ly = pt.ay + (by - pt.ay) * t;
          const x = cx + lx * size + pt.dx * burst * K * 0.3;
          const y = cy + ly * size + pt.dy * burst * K * 0.3;
          const s = pt.sz * (1 + burst * 1.5);
          ctx!.globalAlpha = vis * (tr.disperse ? 1 - t * 0.9 : 1);
          ctx!.fillStyle = `rgb(${pt.r | 0},${pt.g | 0},${pt.b | 0})`;
          ctx!.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      tick();
    }

    function tick() {
      if (running && !raf) raf = requestAnimationFrame(frame);
    }

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
      cancelled = true;
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
