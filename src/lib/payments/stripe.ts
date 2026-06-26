import Stripe from "stripe";

/**
 * Stripe client factory. Used only for OUR OWN products (source: "own") —
 * Amazon/Noon affiliate products never touch payment. Honest gating: when
 * STRIPE_SECRET_KEY is unset, getStripe() returns null and the checkout flow
 * shows a clear "online payment is being set up" state instead of failing.
 *
 * Env (owner sets in production):
 *   STRIPE_SECRET_KEY        sk_live_… / sk_test_…
 *   STRIPE_WEBHOOK_SECRET    whsec_…  (for /api/stripe/webhook)
 *   CHECKOUT_CURRENCY        defaults to "aed"
 */

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

export const CHECKOUT_CURRENCY = (
  process.env.CHECKOUT_CURRENCY || "aed"
).toLowerCase();
