import { TrendingUp, ShoppingBag, Receipt, Package } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getOrders } from "@/lib/orders";
import { formatAED } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const all = getOrders();
  // Cancelled orders don't count as revenue; everything else was paid.
  const paid = all.filter((o) => o.status !== "cancelled");

  const revenue = paid.reduce((s, o) => s + o.amountAed, 0);
  const count = paid.length;
  const aov = count ? revenue / count : 0;

  const since = Date.now() - 30 * 86_400_000;
  const last30 = paid.filter((o) => Date.parse(o.createdAt) >= since);
  const revenue30 = last30.reduce((s, o) => s + o.amountAed, 0);

  // Top products by units sold.
  const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of paid) {
    for (const it of o.items) {
      const cur = byProduct.get(it.slug) ?? { name: it.name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.priceAed * it.qty;
      byProduct.set(it.slug, cur);
    }
  }
  const top = [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);

  const statuses = ["paid", "shipped", "delivered", "shipping_failed", "cancelled"] as const;
  const byStatus = statuses.map((s) => ({
    status: s,
    count: all.filter((o) => o.status === s).length,
  }));

  const stats = [
    { label: "Revenue (all)", value: formatAED(revenue), Icon: TrendingUp },
    { label: "Revenue (30 days)", value: formatAED(revenue30), Icon: Receipt },
    { label: "Orders", value: String(count), Icon: ShoppingBag },
    { label: "Avg. order", value: formatAED(Math.round(aov)), Icon: Package },
  ];

  return (
    <AdminShell active="/admin/analytics" title="Sales analytics">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-line/70 bg-surface/40 p-5">
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-4 font-display text-2xl font-semibold text-chrome">{value}</p>
            <p className="text-sm text-ash">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
          <h2 className="font-display text-lg font-semibold text-chrome">Top products</h2>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-ash-dim">No sales yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {top.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-ash">{p.name}</span>
                  <span className="shrink-0 text-sm text-chrome">
                    {p.qty} sold · {formatAED(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
          <h2 className="font-display text-lg font-semibold text-chrome">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <span className="text-sm capitalize text-ash">{s.status.replace("_", " ")}</span>
                <span className="text-sm font-medium text-chrome">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
