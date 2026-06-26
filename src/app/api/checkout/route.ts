import { NextResponse, type NextRequest } from "next/server";
import { getProduct, isBuyable, localized } from "@/lib/catalog";
import { getStripe, CHECKOUT_CURRENCY } from "@/lib/payments/stripe";

/**
 * Create a Stripe Checkout Session for OUR OWN products. The client sends only
 * { slug, qty } pairs — every price is re-read from the catalog here so the
 * browser can never set an amount. Affiliate items are ignored (they link out
 * and never reach checkout). Honest gating: if Stripe is not configured we
 * return 503 so the cart shows a clear "payment is being set up" message.
 */

const COUNTRIES = (process.env.CHECKOUT_COUNTRIES || "AE")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean) as ("AE" | "SA")[];

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: { lines?: { slug: string; qty: number }[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const locale = body.locale === "ar" ? "ar" : "en";
  const lines = Array.isArray(body.lines) ? body.lines : [];
  const origin = req.nextUrl.origin;

  const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] =
    [];
  const meta: { slug: string; qty: number }[] = [];

  for (const line of lines) {
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line?.qty) || 0)));
    const product = getProduct(String(line?.slug ?? ""));
    if (!product || !isBuyable(product) || qty < 1) continue;
    const name = localized(product, locale).name;
    lineItems.push({
      quantity: qty,
      price_data: {
        currency: CHECKOUT_CURRENCY,
        unit_amount: Math.round((product.priceAed as number) * 100),
        product_data: {
          name,
          images: product.image.startsWith("/")
            ? [`${origin}${product.image}`]
            : product.image
              ? [product.image]
              : undefined,
          metadata: { slug: product.slug },
        },
      },
    });
    meta.push({ slug: product.slug, qty });
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  // Optional flat shipping fee (AED). Unset → no shipping line (free/handled later).
  const shippingFee = Number(process.env.SHIPPING_FEE_AED || 0);
  const shippingOptions =
    shippingFee > 0
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: {
                amount: Math.round(shippingFee * 100),
                currency: CHECKOUT_CURRENCY,
              },
              display_name: locale === "ar" ? "الشحن" : "Shipping",
            },
          },
        ]
      : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: COUNTRIES },
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      ...(shippingOptions && { shipping_options: shippingOptions }),
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/cart`,
      metadata: { cart: JSON.stringify(meta).slice(0, 480), locale },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "checkout failed" },
      { status: 500 },
    );
  }
}
