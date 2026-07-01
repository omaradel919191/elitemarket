import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { getProduct, localized, decrementStock, resolveUnit } from "@/lib/catalog";
import {
  upsertOrder,
  updateOrder,
  getOrder,
  type Order,
  type OrderItem,
  type ShippingAddress,
} from "@/lib/orders";
import { createShipment, isOtoConfigured } from "@/lib/shipping/oto";
import { sendOrderEmails } from "@/lib/email";

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
    console.error("stripe webhook signature verification failed:", e);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
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
  let cart: { slug: string; qty: number; variantId?: string }[] = [];
  try {
    cart = JSON.parse(session.metadata?.cart ?? "[]");
  } catch {
    cart = [];
  }
  const items: OrderItem[] = [];
  for (const c of cart) {
    const p = getProduct(c.slug);
    if (!p) continue;
    const unit = resolveUnit(p, c.variantId);
    if (unit.priceAed == null) continue;
    const base = localized(p, locale).name;
    items.push({
      slug: p.slug,
      ...(c.variantId && { variantId: c.variantId }),
      name: unit.variantName ? `${base} — ${unit.variantName}` : base,
      qty: Math.max(1, Math.floor(Number(c.qty) || 1)),
      priceAed: unit.priceAed,
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
  // UAE (and similar) address forms put the city/emirate in `state`, leaving
  // `city` empty. Use the emirate as the city so the order has somewhere to ship.
  if (!customer.city?.trim() && customer.state?.trim()) {
    customer.city = customer.state;
  }

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
  decrementStock(
    items.map((i) => ({ slug: i.slug, qty: i.qty, variantId: i.variantId })),
  );

  // Hand to the courier (best-effort; never fails the webhook).
  if (isOtoConfigured()) {
    if (!customer.city?.trim()) {
      // No city to ship to. Log the raw Stripe address server-side for triage,
      // but keep PII out of the persisted order record.
      console.error(`order ${order.id}: no shipping city captured`, {
        pi_shipping: piShipping?.address ?? null,
        collected: sx.collected_information?.shipping_details?.address ?? null,
        session_shipping: sx.shipping_details?.address ?? null,
        billing: details?.address ?? null,
      });
      updateOrder(order.id, {
        status: "shipping_failed",
        shipping: { provider: "oto", error: "No shipping city captured" },
      });
    } else {
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
  }

  // Order confirmation + owner notification (best-effort; never blocks).
  await sendOrderEmails(getOrder(order.id) ?? order);

  return NextResponse.json({ received: true });
}
