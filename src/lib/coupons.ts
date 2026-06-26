import fs from "node:fs";
import path from "node:path";

/**
 * Server-only discount-code store, backed by a JSON file in DATA_DIR (same
 * pattern as products/orders). The admin manages codes; the cart validates them
 * and checkout re-validates server-side before applying the discount in Stripe.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const FILE = path.join(DATA_DIR, "coupons.json");

export type Coupon = {
  code: string; // stored uppercase
  type: "percent" | "fixed";
  value: number; // percent 1-100, or fixed AED amount
  active: boolean;
  minAed?: number | null; // minimum subtotal to qualify
  expiresAt?: string | null; // ISO date (end of day) or null
};

function readAll(): Coupon[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Coupon[];
  } catch {
    return [];
  }
}

function writeAll(coupons: Coupon[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(coupons, null, 2), "utf8");
}

export function getCoupons(): Coupon[] {
  return readAll();
}

export function saveCoupon(coupon: Coupon): void {
  const all = readAll();
  const i = all.findIndex((c) => c.code === coupon.code);
  if (i >= 0) all[i] = coupon;
  else all.push(coupon);
  writeAll(all);
}

export function deleteCoupon(code: string): void {
  writeAll(readAll().filter((c) => c.code !== code.toUpperCase()));
}

export type CouponResult =
  | { ok: true; code: string; discountAed: number; label: string }
  | { ok: false; error: string };

/** Validate a code against a subtotal and compute the discount (in AED). */
export function validateCoupon(
  rawCode: string,
  subtotalAed: number,
): CouponResult {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };
  const coupon = readAll().find((c) => c.code === code);
  if (!coupon || !coupon.active) {
    return { ok: false, error: "Invalid or expired code" };
  }
  if (coupon.expiresAt) {
    const exp = Date.parse(coupon.expiresAt);
    if (Number.isFinite(exp) && Date.now() > exp + 86_400_000) {
      return { ok: false, error: "This code has expired" };
    }
  }
  if (coupon.minAed && subtotalAed < coupon.minAed) {
    return { ok: false, error: `Spend at least ${coupon.minAed} AED to use this code` };
  }
  const discountAed =
    coupon.type === "percent"
      ? Math.round((subtotalAed * coupon.value) / 100)
      : Math.min(coupon.value, subtotalAed);
  if (discountAed <= 0) return { ok: false, error: "Code has no effect on this cart" };

  const label =
    coupon.type === "percent" ? `${coupon.value}% off` : `${coupon.value} AED off`;
  return { ok: true, code, discountAed, label };
}
