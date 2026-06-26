import Image from "next/image";
import { Sparkles, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAllProducts } from "@/lib/catalog";
import { formatAED } from "@/lib/utils";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = getAllProducts();

  return (
    <AdminShell active="/admin/products" title="Products">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ash">{products.length} products</p>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" />
          AI Generator
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line/70">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-ash-dim">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.slug}
                className="border-b border-line/50 last:border-0 hover:bg-surface/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span>
                      <span className="block font-medium text-chrome">
                        {p.name}
                      </span>
                      <span className="block text-xs text-ash-dim">
                        {p.brand}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-ash">{p.category}</td>
                <td className="px-4 py-3 text-ash">
                  {p.priceAed != null ? formatAED(p.priceAed) : "—"}
                </td>
                <td className="px-4 py-3 text-ash">{p.rating ?? "—"}</td>
                <td className="px-4 py-3">
                  {p.deal ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                      Deal
                    </span>
                  ) : (
                    <span className="text-ash-dim">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/product/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold hover:text-gold-soft"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
