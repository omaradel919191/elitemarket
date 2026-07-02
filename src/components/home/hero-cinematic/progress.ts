// Mutable singleton read every frame by the cinematic hero (no React
// re-renders on scroll). ScrollTrigger writes `value` (0..1).
export const heroProgress = { value: 0 };

/** Scroll length of the pinned hero, in viewport heights. */
export const HERO_VH = 620;

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Trapezoid 0→1→0 for crossfading a clip in and out across scroll. */
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

export type Clip = {
  key: string;
  video: string;
  poster: string;
  /** i18n category key — present only on product clips (shows a caption). */
  caption?: string;
  in0: number;
  in1: number;
  out0: number;
  out1: number;
};

// Three worlds only — the products Elite actually sells: watches → perfumes →
// sunglasses. Every clip loops and plays continuously (never seeked or paused
// on scroll), so scroll just cross-fades opacity — no video-decode skip. The
// EM finale + CTA is a CSS overlay, so there is no off-brand "beauty" footage.
export const CLIPS: Clip[] = [
  { key: "watch", video: "/brand/videos/watch.mp4", poster: "/brand/products/watch.png", caption: "watches", in0: -1, in1: 0.04, out0: 0.30, out1: 0.40 },
  { key: "perfume", video: "/brand/videos/perfume.mp4", poster: "/brand/products/perfume.png", caption: "perfumes", in0: 0.30, in1: 0.40, out0: 0.60, out1: 0.70 },
  { key: "sunglasses", video: "/brand/videos/sunglasses.mp4", poster: "/brand/products/sunglasses.png", caption: "sunglasses", in0: 0.60, in1: 0.70, out0: 0.96, out1: 1.1 },
];
