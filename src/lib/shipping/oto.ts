import type { Order } from "@/lib/orders";

/**
 * OTO (tryoto.com) courier adapter — creates a shipment for a paid order of our
 * OWN products. Honest gating: with no OTO_REFRESH_TOKEN the adapter is a no-op
 * that reports "not configured" so the order is simply left as "paid" for manual
 * handling; nothing fakes a tracking number.
 *
 * Auth model: OTO issues a long-lived refresh token in their dashboard; we
 * exchange it for a short-lived access token, then call createOrder.
 *
 * Env (owner sets in production once they have an OTO account):
 *   OTO_REFRESH_TOKEN       required — from the OTO dashboard
 *   OTO_BASE_URL            optional — defaults to https://api.tryoto.com
 *   OTO_DELIVERY_OPTION_ID  optional — pin a delivery company; else OTO auto-picks
 *   OTO_PICKUP_LOCATION     optional — warehouse/pickup location code
 *
 * NOTE: OTO's exact field names can vary by account/version. This sends the
 * documented v2 shape and parses the common response keys defensively; adjust
 * the payload once a live OTO account is connected.
 */

const BASE = (process.env.OTO_BASE_URL || "https://api.tryoto.com").replace(
  /\/+$/,
  "",
);

export function isOtoConfigured(): boolean {
  return !!process.env.OTO_REFRESH_TOKEN;
}

export type OtoResult = {
  ok: boolean;
  ref?: string | null;
  trackingNumber?: string | null;
  label?: string | null;
  error?: string | null;
};

async function getAccessToken(): Promise<string | null> {
  const refresh = process.env.OTO_REFRESH_TOKEN;
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE}/rest/v2/refreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const token =
      (data.access_token as string) ||
      (data.token as string) ||
      ((data.data as Record<string, unknown>)?.access_token as string);
    return token || null;
  } catch {
    return null;
  }
}

function pick<T = string>(obj: Record<string, unknown>, ...keys: string[]): T | null {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== "") return v as T;
  }
  return null;
}

/**
 * Create an OTO shipment for a paid order. Never throws — always resolves to an
 * OtoResult the caller stores on the order.
 */
export async function createShipment(order: Order): Promise<OtoResult> {
  if (!isOtoConfigured()) {
    return { ok: false, error: "OTO not configured" };
  }
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "OTO auth failed (check OTO_REFRESH_TOKEN)" };
  }

  const c = order.customer;
  const payload: Record<string, unknown> = {
    orderId: order.id,
    payment_method: "paid", // already captured via Stripe
    amount: order.amountAed,
    amount_due: 0,
    currency: (order.currency || "AED").toUpperCase(),
    customer: {
      name: c.name || "Customer",
      mobile: c.phone || "",
      email: c.email || "",
      address: [c.line1, c.line2].filter(Boolean).join(", "),
      district: c.state || "",
      city: c.city || "",
      country: c.country || "AE",
      postcode: c.postalCode || "",
    },
    items: order.items.map((it) => ({
      productId: it.slug,
      name: it.name,
      price: it.priceAed,
      quantity: it.qty,
      rowTotal: it.priceAed * it.qty,
    })),
    ...(process.env.OTO_DELIVERY_OPTION_ID && {
      deliveryOptionId: process.env.OTO_DELIVERY_OPTION_ID,
    }),
    ...(process.env.OTO_PICKUP_LOCATION && {
      pickupLocationCode: process.env.OTO_PICKUP_LOCATION,
    }),
  };

  try {
    const res = await fetch(`${BASE}/rest/v2/createOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || data.success === false) {
      return {
        ok: false,
        error:
          (pick(data, "message", "error") as string) ||
          `OTO createOrder HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      ref: pick(data, "otoId", "orderId", "id"),
      trackingNumber: pick(data, "trackingNumber", "awb", "trackingNo"),
      label: pick(data, "labelUrl", "shippingLabel", "label"),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "OTO request failed",
    };
  }
}
