import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { CsvImport } from "@/components/admin/csv-import";

export default async function ImportProductsPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/products" title="Import products (CSV)">
      <CsvImport />
    </AdminShell>
  );
}
