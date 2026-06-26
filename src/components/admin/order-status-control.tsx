"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/orders";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "shipping_failed", label: "Shipping failed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Dropdown to manually change an order's status. */
export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(status: string) {
    if (busy || status === current) return;
    setBusy(true);
    try {
      await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={current}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      aria-label="Order status"
      className="mt-1.5 h-7 rounded-lg border border-line bg-night/60 px-2 text-xs text-chrome focus:border-gold/50 focus:outline-none disabled:opacity-40"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
