import fs from "node:fs";
import path from "node:path";

/**
 * Server-only order store for our OWN products. Backed by a JSON file in
 * DATA_DIR (the persistent volume) — same pattern as the catalog. Orders are
 * created by the Stripe webhook after a successful payment, then handed to the
 * courier (OTO). The admin reviews them at /admin/orders.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const FILE = path.join(DATA_DIR, "orders.json");

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  priceAed: number;
};

export type ShippingAddress = {
  name?: string;
  phone?: string;
  email?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export type OrderStatus =
  | "paid" // payment captured, not yet shipped
  | "shipping_failed" // courier call failed — needs manual handling
  | "shipped" // courier accepted, AWB issued
  | "cancelled";

export type Order = {
  id: string; // our id (Stripe session id)
  createdAt: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  amountAed: number;
  currency: string;
  customer: ShippingAddress;
  payment: { provider: "stripe"; ref: string };
  shipping: {
    provider: "oto" | null;
    ref?: string | null; // OTO order id
    trackingNumber?: string | null; // AWB
    label?: string | null; // label URL
    error?: string | null;
  };
};

function readAll(): Order[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Order[];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function getOrders(): Order[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id: string): Order | undefined {
  return readAll().find((o) => o.id === id);
}

/** Insert or replace an order by id (webhook is idempotent on the session id). */
export function upsertOrder(order: Order): void {
  const all = readAll();
  const i = all.findIndex((o) => o.id === order.id);
  if (i >= 0) all[i] = order;
  else all.push(order);
  writeAll(all);
}

export function deleteOrder(id: string): void {
  writeAll(readAll().filter((o) => o.id !== id));
}

export function updateOrder(id: string, patch: Partial<Order>): Order | undefined {
  const all = readAll();
  const i = all.findIndex((o) => o.id === id);
  if (i < 0) return undefined;
  all[i] = { ...all[i], ...patch };
  writeAll(all);
  return all[i];
}
