import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductGenerator } from "@/components/admin/product-generator";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/products/new" title="AI Product Generator">
      <ProductGenerator />
    </AdminShell>
  );
}
