import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { updateOrder, type OrderStatus } from "@/lib/orders";

const STATUSES: OrderStatus[] = [
  "paid",
  "shipping_failed",
  "shipped",
  "delivered",
  "cancelled",
];

/** Manually set an order's status (e.g. mark delivered/cancelled). Admin-guarded. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const status = body.status as OrderStatus;
  if (!body.id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and a valid status are required" }, { status: 400 });
  }
  const updated = updateOrder(String(body.id), { status });
  if (!updated) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
