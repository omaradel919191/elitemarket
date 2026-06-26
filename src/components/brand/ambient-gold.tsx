"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide ambient backdrop: slow-drifting gold dust + occasional subtle
 * golden bursts on the dark base. One canvas, capped density + DPR, paused
 * when the tab is hidden, and fully static under prefers-reduced-motion.
 * Sits at z-0 behind content; transparent sections reveal it, the hero's
 * own black background keeps the hero cinematic.
 */

const GOLD: number[][] = [
  [214, 175, 55], // signature gold #d6af37
  [231, 199, 102], // soft gold
  [246, 231, 168], // pale highlight
];

type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tw: number;
  c: number[];
};
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  c: number[];
};

export function AmbientGold() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let lastBurst = 0;
    let running = true;
    const dust: Dust[] = [];
    const sparks: Spark[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () => GOLD[(Math.random() * GOLD.length) | 0];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(64, Math.round((w * h) / 26000));
      dust.length = 0;
      for (let i = 0; i < target; i++) {
        dust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: rand(-0.08, 0.08),
          vy: rand(-0.26, -0.05),
          r: rand(0.5, 2),
          a: rand(0.14, 0.6),
          tw: rand(0.004, 0.018),
          c: pick(),
        });
      }
    };

    const burst = (t: number) => {
      const cx = rand(w * 0.1, w * 0.9);
      const cy = rand(h * 0.15, h * 0.85);
      const n = 8 + ((Math.random() * 6) | 0);
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n + rand(-0.3, 0.3);
        const sp = rand(0.4, 1.4);
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: rand(40, 80),
          r: rand(0.8, 1.8),
          c: pick(),
        });
      }
      lastBurst = t;
    };

    const drawDot = (x: number, y: number, r: number, c: number[], a: number) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        d.a += d.tw;
        if (d.a > 0.66 || d.a < 0.1) d.tw *= -1;
        if (d.y < -4) {
          d.y = h + 4;
          d.x = Math.random() * w;
        }
        if (d.x < -4) d.x = w + 4;
        else if (d.x > w + 4) d.x = -4;
        drawDot(d.x, d.y, d.r, d.c, d.a);
      }

      if (t - lastBurst > 2600) burst(t);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        const k = 1 - s.life / s.max;
        if (k <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        drawDot(s.x, s.y, s.r * (0.6 + k), s.c, 0.7 * k);
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();

    if (reduce) {
      // Static, faint specks — no animation loop.
      ctx.globalCompositeOperation = "lighter";
      for (const d of dust.slice(0, 24)) drawDot(d.x, d.y, d.r, d.c, 0.22);
      return;
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0" />
  );
}
