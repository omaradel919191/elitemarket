import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { getProduct, localized, decrementStock } from "@/lib/catalog";
import {
  upsertOrder,
  updateOrder,
  type Order,
  type OrderItem,
  type ShippingAddress,
} from "@/lib/orders";
import { createShipment, isOtoConfigured } from "@/lib/shipping/oto";

/**
 * Stripe webhook. On a successful checkout it records the order (re-pricing
 * items from the catalog), decrements stock, and hands the order to the courier
 * (OTO). Verifies the signature with STRIPE_WEBHOOK_SECRET — without it the
 * endpoint refuses to trust the payload.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Merge shipping + billing addresses field-by-field (shipping wins). */
function mergeAddress(
  shipping: Stripe.Address | null | undefined,
  billing: Stripe.Address | null | undefined,
): Partial<ShippingAddress> {
  const pick = (k: keyof Stripe.Address) =>
    (shipping?.[k] as string | null) || (billing?.[k] as string | null) || "";
  return {
    line1: pick("line1"),
    line2: pick("line2"),
    city: pick("city"),
    state: pick("state"),
    country: pick("country"),
    postalCode: pick("postal_code"),
  };
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad signature" },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  // Rebuild items from our metadata, re-priced from the catalog (never trust
  // amounts from the client).
  const locale = (session.metadata?.locale as string) === "ar" ? "ar" : "en";
  let cart: { slug: string; qty: number }[] = [];
  try {
    cart = JSON.parse(session.metadata?.cart ?? "[]");
  } catch {
    cart = [];
  }
  const items: OrderItem[] = [];
  for (const c of cart) {
    const p = getProduct(c.slug);
    if (!p || p.priceAed == null) continue;
    items.push({
      slug: p.slug,
      name: localized(p, locale).name,
      qty: Math.max(1, Math.floor(Number(c.qty) || 1)),
      priceAed: p.priceAed,
    });
  }

  const details = session.customer_details;
  // The session's shipping fields move between API versions (shipping_details →
  // collected_information.shipping_details). The PaymentIntent's `shipping`
  // object reliably carries the collected shipping address across versions, so
  // retrieve it and use it as the primary source.
  let piShipping: Stripe.PaymentIntent.Shipping | null = null;
  const piId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      piShipping = pi.shipping ?? null;
    } catch {
      /* fall back to the session's own fields below */
    }
  }

  const sx = session as unknown as {
    collected_information?: { shipping_details?: { address?: Stripe.Address; name?: string } };
    shipping_details?: { address?: Stripe.Address; name?: string };
  };
  const ship = sx.collected_information?.shipping_details ?? sx.shipping_details;
  const shippingAddr = piShipping?.address ?? ship?.address;

  const customer: ShippingAddress = {
    name: piShipping?.name || ship?.name || details?.name || "",
    email: details?.email || "",
    phone: piShipping?.phone || details?.phone || "",
    ...mergeAddress(shippingAddr, details?.address),
  };

  const order: Order = {
    id: session.id,
    createdAt: new Date().toISOString(),
    status: "paid",
    items,
    amountAed: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "aed").toUpperCase(),
    customer,
    payment: { provider: "stripe", ref: session.payment_intent as string },
    shipping: { provider: isOtoConfigured() ? "oto" : null },
  };
  upsertOrder(order);
  decrementStock(items.map((i) => ({ slug: i.slug, qty: i.qty })));

  // Hand to the courier (best-effort; never fails the webhook).
  if (isOtoConfigured()) {
    const r = await createShipment(order);
    updateOrder(order.id, {
      status: r.ok ? "shipped" : "shipping_failed",
      shipping: {
        provider: "oto",
        ref: r.ref ?? null,
        trackingNumber: r.trackingNumber ?? null,
        label: r.label ?? null,
        error: r.ok ? null : r.error ?? "shipment failed",
      },
    });
  }

  return NextResponse.json({ received: true });
}
