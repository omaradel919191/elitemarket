import { Package, Tag, Layers, Link2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAllProducts, getDeals } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/site";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const products = getAllProducts();
  const deals = getDeals();
  const linkCount = products.reduce((n, p) => n + p.links.length, 0);

  const stats = [
    { label: "Products", value: products.length, Icon: Package },
    { label: "Categories", value: CATEGORIES.length, Icon: Layers },
    { label: "Active deals", value: deals.length, Icon: Tag },
    { label: "Retailer links", value: linkCount, Icon: Link2 },
  ];

  const byCategory = CATEGORIES.map((c) => ({
    slug: c.slug,
    count: products.filter((p) => p.category === c.slug).length,
  }));

  const env = [
    { key: "DATABASE_URL", set: !!process.env.DATABASE_URL, note: "Live catalog DB" },
    { key: "ANTHROPIC_API_KEY", set: !!process.env.ANTHROPIC_API_KEY, note: "AI generator + assistant" },
    { key: "AMAZON_AFFILIATE_TAG", set: !!process.env.AMAZON_AFFILIATE_TAG, note: "Amazon commission" },
    { key: "NOON_AFFILIATE_QUERY", set: !!process.env.NOON_AFFILIATE_QUERY, note: "Noon commission" },
  ];

  return (
    <AdminShell active="/admin" title="Dashboard">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-line/70 bg-surface/40 p-5"
          >
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-4 font-display text-3xl font-semibold text-chrome">
              {value}
            </p>
            <p className="text-sm text-ash">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
          <h2 className="font-display text-lg font-semibold text-chrome">
            By category
          </h2>
          <ul className="mt-4 space-y-3">
            {byCategory.map((c) => (
              <li key={c.slug} className="flex items-center justify-between">
                <span className="text-sm capitalize text-ash">{c.slug}</span>
                <span className="text-sm font-medium text-chrome">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
          <h2 className="font-display text-lg font-semibold text-chrome">
            Configuration
          </h2>
          <ul className="mt-4 space-y-3">
            {env.map((e) => (
              <li key={e.key} className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-mono text-xs text-ash">{e.key}</span>
                  <span className="block text-xs text-ash-dim">{e.note}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    e.set
                      ? "bg-success/15 text-success"
                      : "bg-line/60 text-ash-dim"
                  }`}
                >
                  {e.set ? "Configured" : "Not set"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-line/70 bg-night/40 px-4 py-3 text-xs leading-relaxed text-ash-dim">
        The catalog is currently a clearly-marked example seed in{" "}
        <code className="font-mono">src/lib/catalog.ts</code>. Populate real
        products and connect a database (DATABASE_URL) to go live; set affiliate
        tags so out-links earn commission.
      </p>
    </AdminShell>
  );
}
