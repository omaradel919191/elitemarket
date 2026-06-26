import type { Order } from "./orders";
import { SITE } from "./site";
import { formatAED } from "./utils";

/**
 * Transactional email via Resend (https://resend.com). Sends an order
 * confirmation to the customer and a "new order" notification to the owner.
 * Honest gating: with no RESEND_API_KEY this is a no-op — nothing is sent and
 * the order still completes. Never throws.
 *
 * Env (owner sets in production):
 *   RESEND_API_KEY       re_…
 *   EMAIL_FROM           e.g. "Elite Market <orders@eliteperfumeuae.com>"
 *                        (the domain must be verified in Resend)
 *   ORDER_NOTIFY_EMAIL   where owner gets new-order alerts (defaults to SITE.email)
 */

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function rows(order: Order): string {
  return order.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;color:#cbd2da">${it.qty}× ${it.name}</td>` +
        `<td style="padding:6px 0;text-align:right;color:#cbd2da">${formatAED(
          it.priceAed * it.qty,
        )}</td></tr>`,
    )
    .join("");
}

function shell(title: string, body: string): string {
  return `<div style="background:#08080a;padding:32px 0;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#0f0f12;border:1px solid #23262d;border-radius:16px;padding:28px">
    <div style="font-size:22px;font-weight:700;color:#d4af37;margin-bottom:4px">ELITE MARKET</div>
    <h1 style="font-size:20px;color:#f4f5f7;margin:16px 0 8px">${title}</h1>
    ${body}
    <p style="margin-top:24px;font-size:12px;color:#7a808a">Elite Market · ${SITE.url}</p>
  </div>
</div>`;
}

function customerHtml(order: Order): string {
  const c = order.customer;
  return shell(
    "Thank you for your order!",
    `<p style="color:#94a3b8;font-size:14px">Your order is confirmed and being prepared for shipping.</p>
     <p style="color:#94a3b8;font-size:13px">Order reference: <b style="color:#cbd2da">${order.id.slice(-12)}</b></p>
     <table style="width:100%;border-top:1px solid #23262d;border-bottom:1px solid #23262d;margin:16px 0;border-collapse:collapse">${rows(order)}
       <tr><td style="padding:10px 0;color:#f4f5f7;font-weight:700">Total</td>
       <td style="padding:10px 0;text-align:right;color:#d4af37;font-weight:700">${formatAED(order.amountAed)}</td></tr></table>
     <p style="color:#94a3b8;font-size:13px">Shipping to: ${[c.name, c.line1, c.city, c.country].filter(Boolean).join(", ")}</p>`,
  );
}

function ownerHtml(order: Order): string {
  const c = order.customer;
  return shell(
    "New order received 🎉",
    `<table style="width:100%;border-bottom:1px solid #23262d;margin:8px 0;border-collapse:collapse">${rows(order)}
       <tr><td style="padding:10px 0;color:#f4f5f7;font-weight:700">Total</td>
       <td style="padding:10px 0;text-align:right;color:#d4af37;font-weight:700">${formatAED(order.amountAed)}</td></tr></table>
     <p style="color:#94a3b8;font-size:13px">Customer: ${c.name || "—"} · ${c.phone || ""} · ${c.email || ""}</p>
     <p style="color:#94a3b8;font-size:13px">Address: ${[c.line1, c.line2, c.city, c.state, c.country].filter(Boolean).join(", ")}</p>
     <p style="color:#94a3b8;font-size:13px">Shipping: ${order.shipping.trackingNumber ? `AWB ${order.shipping.trackingNumber}` : order.status}</p>`,
  );
}

async function send(
  key: string,
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    /* email is best-effort — never block the order */
  }
}

export async function sendOrderEmails(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM || `Elite Market <orders@${SITE.domain}>`;
  const ownerTo = process.env.ORDER_NOTIFY_EMAIL || SITE.email;

  if (order.customer.email) {
    await send(
      key,
      from,
      order.customer.email,
      `Your Elite Market order ${order.id.slice(-8)}`,
      customerHtml(order),
    );
  }
  await send(key, from, ownerTo, `New order — ${formatAED(order.amountAed)}`, ownerHtml(order));
}
