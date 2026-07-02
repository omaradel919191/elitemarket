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

// The story: product (hold) → transition (dissolve → reassemble) → next
// product → … → final transition (explode to particles) → EM finale.
// Three worlds: watches → perfumes → sunglasses → EM finale.
export const CLIPS: Clip[] = [
  { key: "watch", video: "/brand/videos/watch.mp4", poster: "/brand/products/watch.png", caption: "watches", in0: -1, in1: 0.02, out0: 0.13, out1: 0.18 },
  { key: "t1", video: "/brand/videos/t-watch-perfume.mp4", poster: "/brand/products/watch.png", in0: 0.13, in1: 0.18, out0: 0.28, out1: 0.33 },
  { key: "perfume", video: "/brand/videos/perfume.mp4", poster: "/brand/products/perfume.png", caption: "perfumes", in0: 0.28, in1: 0.33, out0: 0.45, out1: 0.5 },
  { key: "t2", video: "/brand/videos/t-perfume-sunglasses.mp4", poster: "/brand/products/perfume.png", in0: 0.45, in1: 0.5, out0: 0.6, out1: 0.65 },
  { key: "sunglasses", video: "/brand/videos/sunglasses.mp4", poster: "/brand/products/sunglasses.png", caption: "sunglasses", in0: 0.6, in1: 0.65, out0: 0.78, out1: 0.83 },
  { key: "finale", video: "/brand/videos/t-beauty-finale.mp4", poster: "/brand/products/sunglasses.png", in0: 0.78, in1: 0.83, out0: 0.93, out1: 0.99 },
];
