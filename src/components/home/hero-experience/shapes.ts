// Samples each luxury product silhouette into a normalized 3D point cloud.
// Product shapes are drawn with the 2D canvas (self-contained, no assets) and
// sampled; "scatter" and "orbit" are procedural. All clouds return Float32Array
// of length count*3 in roughly [-1.2, 1.2] so the particle system can morph
// between any two of them.

export type ShapeKey =
  | "scatter"
  | "watch"
  | "perfume"
  | "sunglasses"
  | "beauty"
  | "orbit";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.fill();
}

const DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, S: number) => void> = {
  watch(ctx, S) {
    const cx = S / 2;
    const cy = S * 0.47;
    const r = S * 0.205;
    // strap (top + bottom, tapering)
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.62, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.62, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.42, S * 0.06);
    ctx.lineTo(cx - r * 0.42, S * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.62, cy + r * 0.7);
    ctx.lineTo(cx + r * 0.62, cy + r * 0.7);
    ctx.lineTo(cx + r * 0.42, S * 0.94);
    ctx.lineTo(cx - r * 0.42, S * 0.94);
    ctx.closePath();
    ctx.fill();
    // case
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // crown
    roundRect(ctx, cx + r - 2, cy - S * 0.018, S * 0.045, S * 0.036, 3);
    // dial hands (carve a touch of detail)
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = S * 0.012;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - r * 0.5);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * 0.36, cy + r * 0.12);
    ctx.stroke();
  },
  perfume(ctx, S) {
    const cx = S / 2;
    // cap
    roundRect(ctx, cx - S * 0.075, S * 0.1, S * 0.15, S * 0.13, 6);
    // neck
    roundRect(ctx, cx - S * 0.045, S * 0.21, S * 0.09, S * 0.07, 3);
    // body
    roundRect(ctx, cx - S * 0.17, S * 0.27, S * 0.34, S * 0.5, S * 0.07);
  },
  sunglasses(ctx, S) {
    const cy = S * 0.5;
    const lw = S * 0.3;
    const lh = S * 0.26;
    const gap = S * 0.07;
    // lenses
    roundRect(ctx, S / 2 - gap / 2 - lw, cy - lh / 2, lw, lh, lh * 0.42);
    roundRect(ctx, S / 2 + gap / 2, cy - lh / 2, lw, lh, lh * 0.42);
    // bridge
    roundRect(ctx, S / 2 - gap / 2, cy - lh * 0.34, gap, lh * 0.18, 4);
    // temples
    ctx.lineWidth = S * 0.03;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(S / 2 - gap / 2 - lw, cy - lh * 0.28);
    ctx.lineTo(S * 0.08, cy - lh * 0.5);
    ctx.moveTo(S / 2 + gap / 2 + lw, cy - lh * 0.28);
    ctx.lineTo(S * 0.92, cy - lh * 0.5);
    ctx.stroke();
  },
  beauty(ctx, S) {
    const cx = S / 2;
    // dropper bulb
    roundRect(ctx, cx - S * 0.04, S * 0.07, S * 0.08, S * 0.06, 4);
    // dropper stem / cap
    roundRect(ctx, cx - S * 0.06, S * 0.12, S * 0.12, S * 0.12, 4);
    // slim serum body
    roundRect(ctx, cx - S * 0.11, S * 0.27, S * 0.22, S * 0.52, S * 0.05);
  },
};

function sampleFromCanvas(key: string, count: number): Float32Array {
  const S = 300;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = "#fff";
  DRAWERS[key](ctx, S);

  const data = ctx.getImageData(0, 0, S, S).data;
  const pts: number[] = [];
  for (let y = 0; y < S; y += 2) {
    for (let x = 0; x < S; x += 2) {
      if (data[(y * S + x) * 4 + 3] > 128) {
        pts.push(x, y);
      }
    }
  }

  const out = new Float32Array(count * 3);
  const rng = mulberry32(key.length * 9973 + 7);
  const HALF = 1.05;
  if (pts.length === 0) return out;
  for (let i = 0; i < count; i++) {
    const idx = (Math.floor(rng() * pts.length) >> 0) * 2;
    const px = pts[idx] + (rng() - 0.5) * 2;
    const py = pts[idx + 1] + (rng() - 0.5) * 2;
    out[i * 3] = ((px - S / 2) / (S / 2)) * HALF;
    out[i * 3 + 1] = -((py - S / 2) / (S / 2)) * HALF;
    out[i * 3 + 2] = (rng() - 0.5) * 0.22;
  }
  return out;
}

function scatterCloud(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(424242);
  for (let i = 0; i < count; i++) {
    const r = 1.6 + rng() * 1.4;
    const t = rng() * Math.PI * 2;
    const ph = Math.acos(2 * rng() - 1);
    out[i * 3] = r * Math.sin(ph) * Math.cos(t);
    out[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t) * 0.75;
    out[i * 3 + 2] = r * Math.cos(ph) * 0.6;
  }
  return out;
}

function orbitCloud(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(70707);
  for (let i = 0; i < count; i++) {
    if (rng() < 0.82) {
      // ring
      const t = rng() * Math.PI * 2;
      const r = 1.28 + (rng() - 0.5) * 0.34;
      out[i * 3] = Math.cos(t) * r;
      out[i * 3 + 1] = Math.sin(t) * r * 0.62;
      out[i * 3 + 2] = (rng() - 0.5) * 0.3;
    } else {
      // faint dust
      const r = rng() * 2.4;
      const t = rng() * Math.PI * 2;
      out[i * 3] = Math.cos(t) * r;
      out[i * 3 + 1] = Math.sin(t) * r * 0.6;
      out[i * 3 + 2] = (rng() - 0.5) * 0.8;
    }
  }
  return out;
}

export function buildShapes(
  count: number,
): Record<ShapeKey, Float32Array> {
  return {
    scatter: scatterCloud(count),
    watch: sampleFromCanvas("watch", count),
    perfume: sampleFromCanvas("perfume", count),
    sunglasses: sampleFromCanvas("sunglasses", count),
    beauty: sampleFromCanvas("beauty", count),
    orbit: orbitCloud(count),
  };
}
