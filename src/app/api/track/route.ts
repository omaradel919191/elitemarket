import { NextResponse, type NextRequest } from "next/server";
import { getOrders } from "@/lib/orders";

/**
 * Public order lookup. Returns a safe subset of an order only when BOTH the
 * reference and the email match — so customers can check status without leaking
 * anyone else's order.
 */
export async function POST(req: NextRequest) {
  let body: { ref?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ found: false }, { status: 400 });
  }
  const ref = (body.ref ?? "").trim().toLowerCase();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!ref || !email) {
    return NextResponse.json({ found: false });
  }

  const order = getOrders().find(
    (o) =>
      (o.id.toLowerCase() === ref || o.id.toLowerCase().endsWith(ref)) &&
      (o.customer.email ?? "").toLowerCase() === email,
  );
  if (!order) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    status: order.status,
    createdAt: order.createdAt,
    trackingNumber: order.shipping.trackingNumber ?? null,
    itemsCount: order.items.reduce((n, i) => n + i.qty, 0),
    amountAed: order.amountAed,
  });
}
