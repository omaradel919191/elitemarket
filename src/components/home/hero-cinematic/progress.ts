// Mutable singleton read every frame by the cinematic hero (no React
// re-renders on scroll). ScrollTrigger writes `value` (0..1).
export const heroProgress = { value: 0 };

/** Scroll length of the pinned hero, in viewport heights. */
export const HERO_VH = 560;

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Trapezoid 0→1→0 for crossfading a scene in and out across scroll. */
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

export type Scene = {
  key: string;
  video: string;
  poster: string;
  /** visibility window across scroll progress */
  in0: number;
  in1: number;
  out0: number;
  out1: number;
};

export const SCENES: Scene[] = [
  {
    key: "watches",
    video: "/brand/videos/watch.mp4",
    poster: "/brand/products/watch.png",
    in0: -1,
    in1: 0.02,
    out0: 0.17,
    out1: 0.23,
  },
  {
    key: "perfumes",
    video: "/brand/videos/perfume.mp4",
    poster: "/brand/products/perfume.png",
    in0: 0.18,
    in1: 0.25,
    out0: 0.37,
    out1: 0.43,
  },
  {
    key: "sunglasses",
    video: "/brand/videos/sunglasses.mp4",
    poster: "/brand/products/sunglasses.png",
    in0: 0.38,
    in1: 0.45,
    out0: 0.57,
    out1: 0.63,
  },
  {
    key: "beauty",
    video: "/brand/videos/beauty.mp4",
    poster: "/brand/products/beauty.png",
    in0: 0.58,
    in1: 0.65,
    out0: 0.78,
    out1: 0.86,
  },
];

/** Transition "gold dust" veil peaks at each scene boundary. */
export const BOUNDARIES = [0.2, 0.4, 0.6, 0.82];

export function veilStrength(p: number) {
  let m = 0;
  for (const b of BOUNDARIES) {
    m = Math.max(m, band(p, b - 0.08, b, b, b + 0.08));
  }
  return m;
}
