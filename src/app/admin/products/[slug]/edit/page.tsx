import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";
import { getProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <AdminShell active="/admin/products" title={`Edit · ${product.name}`}>
      <ProductEditor mode="edit" product={product} />
    </AdminShell>
  );
}
