"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Trash2, Upload, Wand2 } from "lucide-react";
import type { Post } from "@/lib/blog";

export function PostEditor({
  mode,
  post,
}: {
  mode: "create" | "edit";
  post?: Post;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [gen, setGen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [topic, setTopic] = useState("");
  const [f, setF] = useState({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    titleAr: post?.titleAr ?? "",
    excerpt: post?.excerpt ?? "",
    excerptAr: post?.excerptAr ?? "",
    body: post?.body ?? "",
    bodyAr: post?.bodyAr ?? "",
    cover: post?.cover ?? "",
    published: post?.published ?? true,
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      set("cover", data.url);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function generate() {
    if (!topic.trim() || gen) return;
    setGen(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      const d = data.draft ?? {};
      setF((prev) => ({
        ...prev,
        title: d.title || prev.title,
        titleAr: d.titleAr || prev.titleAr,
        excerpt: d.excerpt || prev.excerpt,
        excerptAr: d.excerptAr || prev.excerptAr,
        body: d.body || prev.body,
        bodyAr: d.bodyAr || prev.bodyAr,
      }));
      setMsg(data.ai ? "AI wrote a draft — review and Save." : (data.note ?? "Scaffold filled."));
    } catch {
      setMsg("Generation failed.");
    } finally {
      setGen(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim() || busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/save-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, slug: f.slug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!post || !confirm(`Delete "${post.title}"?`)) return;
    setBusy(true);
    await fetch("/api/admin/delete-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: post.slug }),
    });
    router.push("/admin/posts");
    router.refresh();
  }

  const field =
    "h-11 w-full rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const area =
    "w-full rounded-xl border border-line bg-night/60 px-3.5 py-2.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const lbl = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-dim";
  const card = "rounded-2xl border border-line/70 bg-surface/40 p-6";

  return (
    <form onSubmit={save} className="space-y-6">
      {/* AI writer */}
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-gold" />
          <h2 className="font-display text-lg font-semibold text-chrome">Write with AI</h2>
        </div>
        <p className="mt-1 text-xs text-ash-dim">
          Give a topic (e.g. “How to choose your first oud perfume”) — the AI drafts a bilingual
          article. Review and Save.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Article topic…"
            className="h-11 flex-1 rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={generate}
            disabled={gen || !topic.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            {gen ? "Writing…" : "Generate"}
          </button>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-chrome">Article</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Title (EN)</label>
            <input className={field} value={f.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div>
            <label className={lbl}>Title (AR)</label>
            <input className={field} value={f.titleAr} onChange={(e) => set("titleAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={lbl}>Slug {mode === "edit" && "(fixed)"}</label>
            <input className={field} value={f.slug} onChange={(e) => set("slug", e.target.value)} readOnly={mode === "edit"} placeholder="auto from title" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2.5 text-sm text-ash">
              <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
              Published
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Cover image</label>
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {f.cover && <img src={f.cover} alt="" className="h-full w-full object-cover" />}
              </span>
              <input className={field} value={f.cover} onChange={(e) => set("cover", e.target.value)} placeholder="/media/…  or paste an image URL" />
              <label className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm text-ash transition-colors hover:border-gold/40 hover:text-gold">
                <Upload className="h-4 w-4" />
                {uploading ? "…" : "Upload"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const fl = e.target.files?.[0];
                    if (fl) void uploadCover(fl);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Excerpt (EN)</label>
            <textarea className={area} rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Excerpt (AR)</label>
            <textarea className={area} rows={2} value={f.excerptAr} onChange={(e) => set("excerptAr", e.target.value)} dir="rtl" />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Body (EN) — blank line = new paragraph, “## ” = heading</label>
            <textarea className={area} rows={10} value={f.body} onChange={(e) => set("body", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Body (AR)</label>
            <textarea className={area} rows={10} value={f.bodyAr} onChange={(e) => set("bodyAr", e.target.value)} dir="rtl" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || !f.title.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : "Save article"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-danger/40 px-5 text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
        {msg && <span className="text-sm text-ash">{msg}</span>}
      </div>
    </form>
  );
}
