import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getPost, savePost, type Post } from "@/lib/blog";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const title = String(b.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const slug = b.slug ? slugify(String(b.slug)) : slugify(title);
  const existing = getPost(slug);

  const post: Post = {
    slug,
    title,
    titleAr: String(b.titleAr ?? "").trim(),
    excerpt: String(b.excerpt ?? "").trim(),
    excerptAr: String(b.excerptAr ?? "").trim(),
    body: String(b.body ?? "").trim(),
    bodyAr: String(b.bodyAr ?? "").trim(),
    cover: String(b.cover ?? "").trim(),
    published: b.published !== false,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  savePost(post);
  return NextResponse.json({ ok: true, slug });
}
