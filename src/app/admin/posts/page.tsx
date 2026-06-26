import { Plus, Pencil, ExternalLink, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = getPosts();

  return (
    <AdminShell active="/admin/posts" title="Journal">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ash">{posts.length} articles</p>
        <a
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New article
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-16 text-center">
          <FileText className="mx-auto h-6 w-6 text-ash-dim" />
          <p className="mt-3 text-ash">No articles yet.</p>
          <p className="mt-1 text-xs text-ash-dim">Use “New article” → write a topic → let AI draft it.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line/70">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-ash-dim">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-b border-line/50 last:border-0 hover:bg-surface/40">
                  <td className="px-4 py-3 font-medium text-chrome">{p.title}</td>
                  <td className="px-4 py-3 text-ash">{p.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Published</span>
                    ) : (
                      <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs text-ash-dim">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <a href={`/admin/posts/${p.slug}/edit`} className="inline-flex items-center gap-1 text-gold hover:text-gold-soft">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </a>
                      <a href={`/en/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ash hover:text-chrome">
                        View <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
