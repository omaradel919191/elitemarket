import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deletePost } from "@/lib/blog";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!body.slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  deletePost(String(body.slug));
  return NextResponse.json({ ok: true });
}
