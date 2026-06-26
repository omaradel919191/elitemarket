import fs from "node:fs";
import path from "node:path";

/**
 * Server-only Journal/blog store, backed by a JSON file in DATA_DIR (same
 * pattern as products/orders/coupons). The admin writes posts; the storefront
 * renders the published ones. Body is plain text: blank-line-separated
 * paragraphs, and lines starting with "## " render as headings.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const FILE = path.join(DATA_DIR, "posts.json");

export type Post = {
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  body: string;
  bodyAr: string;
  cover: string;
  published: boolean;
  createdAt: string; // ISO
};

function readAll(): Post[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Post[];
  } catch {
    return [];
  }
}

function writeAll(posts: Post[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2), "utf8");
}

/** All posts, newest first (admin). */
export function getPosts(): Post[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Published posts, newest first (storefront). */
export function getPublishedPosts(): Post[] {
  return getPosts().filter((p) => p.published);
}

export function getPost(slug: string): Post | undefined {
  return readAll().find((p) => p.slug === slug);
}

export function savePost(post: Post): void {
  const all = readAll();
  const i = all.findIndex((p) => p.slug === post.slug);
  if (i >= 0) all[i] = post;
  else all.push(post);
  writeAll(all);
}

export function deletePost(slug: string): void {
  writeAll(readAll().filter((p) => p.slug !== slug));
}

/** Pick the right-language fields for a post. */
export function localizedPost(p: Post, locale: string) {
  const ar = locale === "ar";
  return {
    title: ar ? p.titleAr || p.title : p.title,
    excerpt: ar ? p.excerptAr || p.excerpt : p.excerpt,
    body: ar ? p.bodyAr || p.body : p.body,
  };
}
