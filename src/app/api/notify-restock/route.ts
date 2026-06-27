import { NextResponse, type NextRequest } from "next/server";
import { addRestockRequest } from "@/lib/restock";
import { getProduct } from "@/lib/catalog";

/** Public "notify me when back in stock" capture. */
export async function POST(req: NextRequest) {
  let body: { slug?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const slug = String(body.slug ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!slug || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !getProduct(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  addRestockRequest(slug, email);
  return NextResponse.json({ ok: true });
}
