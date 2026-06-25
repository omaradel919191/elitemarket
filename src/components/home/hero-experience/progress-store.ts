import type { ShapeKey } from "./shapes";

// Mutable singleton read every frame by the 3D scene + overlay (no React
// re-renders on scroll). ScrollTrigger writes `progress` (0..1).
export const heroState = {
  progress: 0,
  ready: false,
};

// Scroll length of the pinned hero, in viewport heights. More = slower, more
// cinematic story beats.
export const HERO_SCROLL_VH = 620;

// Ordered morph stops across the scroll. Each adjacent pair is one segment.
export const STOPS: { key: ShapeKey; at: number }[] = [
  { key: "scatter", at: 0.0 },
  { key: "watch", at: 0.1 },
  { key: "perfume", at: 0.32 },
  { key: "sunglasses", at: 0.54 },
  { key: "beauty", at: 0.76 },
  { key: "orbit", at: 0.99 },
];

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Trapezoid 0→1→0 used for fading overlay scene copy in/out. */
export function band(
  p: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
) {
  if (p < inStart || p > outEnd) return 0;
  if (p < inEnd) return smoothstep(inStart, inEnd, p);
  if (p > outStart) return 1 - smoothstep(outStart, outEnd, p);
  return 1;
}

/** Resolve current segment + eased local mix from global progress. */
export function resolveSegment(progress: number) {
  let i = 0;
  for (let s = 0; s < STOPS.length - 1; s++) {
    if (progress >= STOPS[s].at) i = s;
  }
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = clamp01((progress - a.at) / (b.at - a.at));
  // Hold the formed product, then morph quickly, then settle.
  const eased = smoothstep(0.28, 0.94, t);
  const scatter = Math.sin(clamp01(eased) * Math.PI);
  return { index: i, from: a.key, to: b.key, mix: eased, scatter };
}
