import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { getPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <AdminShell active="/admin/posts" title="Edit article">
      <PostEditor mode="edit" post={post} />
    </AdminShell>
  );
}
