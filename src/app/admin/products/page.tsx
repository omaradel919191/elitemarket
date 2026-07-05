import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminProductsTable } from "@/components/admin/products-table";
import { getAllProducts } from "@/lib/catalog";
import { toCardProduct } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = getAllProducts().map(toCardProduct);

  return (
    <AdminShell active="/admin/products" title="Products">
      <div className="mb-6 flex items-center justify-end gap-2">
        <Link
          href="/admin/products/import"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-ash transition-colors hover:border-gold/40 hover:text-gold"
        >
          Import CSV
        </Link>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <AdminProductsTable products={products} />
    </AdminShell>
  );
}
