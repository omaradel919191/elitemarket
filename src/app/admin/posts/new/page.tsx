import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/posts" title="New article">
      <PostEditor mode="create" />
    </AdminShell>
  );
}
