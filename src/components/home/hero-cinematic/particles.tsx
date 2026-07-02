"use client";

import { useEffect, useRef } from "react";

/**
 * Gold particle field — Canvas 2D, additive glow, depth parallax and mouse
 * reaction. GPU-free so it stays smooth on every phone (no WebGL context loss,
 * no video decode), and it animates on its own rAF loop — no scroll-scrubbing,
 * which is what made the old video hero stutter. Pauses off-screen / when the
 * tab is hidden, and no-ops entirely under prefers-reduced-motion.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = window.innerWidth < 768;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;

    // Soft gold sprite, drawn additively for the glow (far cheaper than a
    // per-particle radial gradient every frame).
    const SPR = 64;
    const sprite = document.createElement("canvas");
    sprite.width = SPR;
    sprite.height = SPR;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
    grad.addColorStop(0, "rgba(240,214,150,1)");
    grad.addColorStop(0.25, "rgba(232,197,122,0.6)");
    grad.addColorStop(1, "rgba(232,197,122,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPR, SPR);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    type Orb = { x: number; y: number; vx: number; vy: number; r: number; d: number; tw: number };
    type Ring = { ang: number; rad: number; r: number; d: number; ph: number };
    type Dust = { x: number; y: number; vx: number; vy: number; r: number; d: number; a: number; tw: number };

    const N_ORB = mobile ? 70 : 150;
    const N_RING = mobile ? 46 : 84;
    const N_DUST = mobile ? 180 : 460;

    let orbs: Orb[] = [];
    let ring: Ring[] = [];
    let dust: Dust[] = [];
    let ringRadius = 0;

    function build() {
      ringRadius = Math.min(w, h) * (mobile ? 0.34 : 0.28);
      orbs = Array.from({ length: N_ORB }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.12, 0.12),
        vy: rand(-0.12, 0.12),
        r: rand(1.2, mobile ? 3.4 : 4.6),
        d: rand(0.25, 1),
        tw: rand(0, Math.PI * 2),
      }));
      ring = Array.from({ length: N_RING }, (_, i) => ({
        ang: (i / N_RING) * Math.PI * 2,
        rad: rand(-14, 14),
        r: rand(1.4, mobile ? 3 : 4),
        d: rand(0.7, 1),
        ph: rand(0, Math.PI * 2),
      }));
      dust = Array.from({ length: N_DUST }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.06, 0.06),
        vy: rand(-0.06, 0.06),
        r: rand(0.4, 1.3),
        d: rand(0.15, 0.9),
        a: rand(0.15, 0.6),
        tw: rand(0, Math.PI * 2),
      }));
    }

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      cx = w / 2;
      cy = h * 0.46;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    resize();
    window.addEventListener("resize", resize);

    // Smoothed pointer offset from centre, in [-1, 1].
    let px = 0;
    let py = 0;
    let tpx = 0;
    let tpy = 0;
    const onMove = (e: PointerEvent) => {
      tpx = (e.clientX / w - 0.5) * 2;
      tpy = (e.clientY / h - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let running = true;
    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting && !document.hidden;
        if (running) tick();
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);
    const onVis = () => {
      running = !document.hidden;
      if (running) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    let t = 0;
    let raf = 0;
    let last = 0;

    function frame(now: number) {
      raf = 0;
      if (!running) return;
      const dt = last ? Math.min((now - last) / 16.6667, 3) : 1;
      last = now;
      t += dt;

      px += (tpx - px) * 0.05;
      py += (tpy - py) * 0.05;
      const par = mobile ? 10 : 26;

      ctx!.clearRect(0, 0, w, h);

      // Dust layer (soft, cheap fills).
      ctx!.fillStyle = "#e8c57a";
      for (const p of dust) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        else if (p.y > h + 8) p.y = -8;
        p.tw += 0.02 * dt;
        const ox = px * par * p.d;
        const oy = py * par * p.d;
        ctx!.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx!.beginPath();
        ctx!.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Glow layers (additive).
      ctx!.globalCompositeOperation = "lighter";

      const rot = t * 0.0016;
      for (const p of ring) {
        const breathe = Math.sin(t * 0.01 + p.ph) * 10;
        const rr = ringRadius + p.rad + breathe;
        const a = p.ang + rot;
        const x = cx + Math.cos(a) * rr + px * par * p.d * 1.3;
        const y = cy + Math.sin(a) * rr * 0.82 + py * par * p.d * 1.3;
        const s = p.r * (2.6 + Math.sin(t * 0.02 + p.ph) * 0.5);
        ctx!.globalAlpha = 0.5;
        ctx!.drawImage(sprite, x - s * 3, y - s * 3, s * 6, s * 6);
      }

      for (const p of orbs) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
        p.tw += 0.015 * dt;
        const ox = px * par * p.d;
        const oy = py * par * p.d;
        const s = p.r * (2.2 + Math.sin(p.tw) * 0.6);
        ctx!.globalAlpha = 0.35 + 0.25 * p.d;
        ctx!.drawImage(sprite, p.x + ox - s * 3, p.y + oy - s * 3, s * 6, s * 6);
      }

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;

      tick();
    }

    function tick() {
      if (running && !raf) raf = requestAnimationFrame(frame);
    }
    tick();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
