import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getOrder, updateOrder } from "@/lib/orders";
import { createShipment, isOtoConfigured } from "@/lib/shipping/oto";

/**
 * Re-attempt the courier shipment for an existing paid order. Admin-guarded.
 * Useful for retrying failed shipments and for surfacing the exact OTO error
 * while wiring up the courier.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isOtoConfigured()) {
    return NextResponse.json(
      { error: "OTO not configured (set OTO_REFRESH_TOKEN)" },
      { status: 400 },
    );
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const order = getOrder(String(body.id ?? ""));
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

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

  return NextResponse.json({ ok: r.ok, error: r.error ?? null });
}
