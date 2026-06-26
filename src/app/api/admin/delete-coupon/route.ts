import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deleteCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!body.code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }
  deleteCoupon(String(body.code));
  return NextResponse.json({ ok: true });
}
