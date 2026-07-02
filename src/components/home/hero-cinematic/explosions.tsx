"use client";

import { useEffect, useRef } from "react";
import { heroProgress, clamp01, smoothstep } from "./progress";

/**
 * Product-dissolve transitions. Each product's own poster is sampled into a
 * cloud of ~2600 gold particles; at a hand-off the current product breaks up
 * into that cloud and the particles RAIN DOWNWARD (gravity + drift), clearing
 * the frame so the next product is revealed beneath them. The last product's
 * particles fall and spread across the full width, settling as a gold-dust
 * background for the finale. Deterministic per scroll value so it scrubs
 * cleanly both ways; desktop cinematic hero only.
 */
const GOLD = [240, 202, 120];
const CAP = 2600;

type Sample = { x: number; y: number; r: number; g: number; b: number };
type Pt = {
  ax: number; ay: number; r: number; g: number; b: number;
  sz: number; vx: number; ph: number; fs: number;
};
type Trans = { tp: number; half: number; finale: boolean; pts: Pt[] };

const IMAGES = [
  "/brand/products/watch.png",
  "/brand/products/perfume.png",
  "/brand/products/sunglasses.png",
];
// One hand-off per product: it turns to particles that fall away, revealing
// the next film. The last (0.90) rains down into the page background.
const DEFS = [
  { tp: 0.35, half: 0.08, src: 0, finale: false },
  { tp: 0.65, half: 0.08, src: 1, finale: false },
  { tp: 0.9, half: 0.11, src: 2, finale: true },
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
          const S = 168;
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
        const n = Math.min(CAP, A.length);
        const pts: Pt[] = [];
        for (let i = 0; i < n; i++) {
          const a = A[i];
          pts.push({
            ax: a.x, ay: a.y,
            // Heavy gold tint so the shatter reads as gold, not the photo.
            r: a.r * 0.35 + GOLD[0] * 0.65,
            g: a.g * 0.35 + GOLD[1] * 0.65,
            b: a.b * 0.35 + GOLD[2] * 0.65,
            sz: rand(1, 2.6),
            vx: rand(-1, 1),
            ph: rand(0, Math.PI * 2),
            fs: rand(0.8, 1.25),
          });
        }
        return { tp: d.tp, half: d.half, finale: d.finale, pts };
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
      const cy = h * 0.44;
      const size = Math.min(w, h) * 0.9;

      ctx!.globalCompositeOperation = "lighter";
      for (const tr of transitions) {
        const d = (p - tr.tp) / tr.half;
        if (d <= -1 || d >= 1) continue;
        const t = (d + 1) / 2; // 0 → 1 through the hand-off
        const grav = t * t; // accelerating fall
        const appear = smoothstep(0, 0.1, t);
        for (const pt of tr.pts) {
          const x0 = cx + pt.ax * size;
          const y0 = cy + pt.ay * size;
          let x: number;
          let y: number;
          let a: number;
          let s: number;
          if (tr.finale) {
            // Rain down and fan out to fill the whole width; hold as gold dust
            // behind the finale copy instead of clearing off-screen.
            x = x0 + pt.vx * w * 0.6 * t + Math.sin(t * 5 + pt.ph) * 6;
            y = y0 + grav * h * 0.82 * pt.fs;
            a = appear * (0.42 + 0.32 * Math.sin(t * Math.PI));
            s = pt.sz * (1 + grav * 0.4);
          } else {
            // Break up and fall straight past the bottom, revealing the next.
            x = x0 + pt.vx * size * 0.22 * t + Math.sin(t * 7 + pt.ph) * 5;
            y = y0 + grav * h * 1.2 * pt.fs;
            a = appear * (1 - smoothstep(0.72, 1, t));
            s = pt.sz * (1 + grav * 0.6);
          }
          if (a <= 0.01) continue;
          ctx!.globalAlpha = clamp01(a);
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
