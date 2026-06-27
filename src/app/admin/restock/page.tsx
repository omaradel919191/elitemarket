import { BellRing } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getRestockRequests } from "@/lib/restock";
import { getProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminRestockPage() {
  await requireAdmin();
  const rows = getRestockRequests();

  // Group emails by product.
  const byProduct = new Map<string, string[]>();
  for (const r of rows) {
    const list = byProduct.get(r.slug) ?? [];
    list.push(r.email);
    byProduct.set(r.slug, list);
  }
  const groups = [...byProduct.entries()];

  return (
    <AdminShell active="/admin/restock" title="Restock requests">
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-16 text-center">
          <BellRing className="mx-auto h-6 w-6 text-ash-dim" />
          <p className="mt-3 text-ash">No restock requests yet.</p>
          <p className="mt-1 text-xs text-ash-dim">
            Customers leave their email on sold-out products; they appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([slug, emails]) => {
            const p = getProduct(slug);
            return (
              <div key={slug} className="rounded-2xl border border-line/70 bg-surface/40 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-chrome">
                    {p?.name ?? slug}
                  </h2>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs text-gold">
                    {emails.length} waiting
                  </span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {emails.map((e) => (
                    <li key={e} className="rounded-lg border border-line/70 bg-night/40 px-2.5 py-1 text-xs text-ash">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
