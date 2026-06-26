import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/products/new" title="Add Product">
      <ProductEditor mode="create" />
    </AdminShell>
  );
}
