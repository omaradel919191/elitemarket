import { ShoppingBag, Truck, AlertTriangle, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getOrders, type OrderStatus } from "@/lib/orders";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { isOtoConfigured } from "@/lib/shipping/oto";
import { RetryShipmentButton } from "@/components/admin/retry-shipment-button";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { formatAED } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-gold/15 text-gold" },
  shipped: { label: "Shipped", cls: "bg-success/15 text-success" },
  delivered: { label: "Delivered", cls: "bg-success/20 text-success" },
  shipping_failed: { label: "Shipping failed", cls: "bg-danger/15 text-danger" },
  cancelled: { label: "Cancelled", cls: "bg-line/60 text-ash-dim" },
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = getOrders();
  const stripeOn = isStripeConfigured();
  const otoOn = isOtoConfigured();

  return (
    <AdminShell active="/admin/orders" title="Orders">
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            stripeOn
              ? "border-success/30 bg-success/10 text-success"
              : "border-line/70 bg-surface/40 text-ash-dim"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Stripe payments: {stripeOn ? "configured" : "not set (STRIPE_SECRET_KEY)"}
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            otoOn
              ? "border-success/30 bg-success/10 text-success"
              : "border-line/70 bg-surface/40 text-ash-dim"
          }`}
        >
          <Truck className="h-4 w-4" />
          OTO courier: {otoOn ? "configured" : "not set (OTO_REFRESH_TOKEN)"}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-16 text-center">
          <p className="text-ash">No orders yet.</p>
          <p className="mt-2 text-xs text-ash-dim">
            Orders for your own products appear here after a successful Stripe
            payment, then are handed to OTO for shipping.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line/70">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-ash-dim">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tracking</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = STATUS[o.status];
                return (
                  <tr
                    key={o.id}
                    className="border-b border-line/50 align-top last:border-0 hover:bg-surface/40"
                  >
                    <td className="px-4 py-3">
                      <span className="block font-mono text-xs text-chrome">
                        {o.id.slice(-12)}
                      </span>
                      <span className="block text-xs text-ash-dim">
                        {o.createdAt.slice(0, 10)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ash">
                      <span className="block text-chrome">{o.customer.name || "—"}</span>
                      <span className="block text-xs text-ash-dim">
                        {o.customer.phone || o.customer.email || ""}
                      </span>
                      <span className="block text-xs text-ash-dim">
                        {[o.customer.city, o.customer.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ash">
                      {o.items.map((it) => (
                        <span key={it.slug} className="block text-xs">
                          {it.qty}× {it.name}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-medium text-chrome">
                      {formatAED(o.amountAed)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${s.cls}`}>
                        {s.label}
                      </span>
                      {o.status === "shipping_failed" && o.shipping.error && (
                        <span className="mt-1 flex items-start gap-1 text-[0.65rem] text-danger">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="max-w-[18rem] break-words">{o.shipping.error}</span>
                        </span>
                      )}
                      {otoOn &&
                        (o.status === "paid" || o.status === "shipping_failed") && (
                          <RetryShipmentButton orderId={o.id} />
                        )}
                      <div>
                        <OrderStatusControl orderId={o.id} current={o.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ash">
                      {o.shipping.trackingNumber ? (
                        o.shipping.label ? (
                          <a
                            href={o.shipping.label}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gold hover:text-gold-soft"
                          >
                            {o.shipping.trackingNumber}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-mono text-xs">
                            {o.shipping.trackingNumber}
                          </span>
                        )
                      ) : (
                        <span className="text-ash-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <DeleteOrderButton orderId={o.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
