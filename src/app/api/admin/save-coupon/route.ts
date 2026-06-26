import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveCoupon, type Coupon } from "@/lib/coupons";

function slugCode(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 24);
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

  const code = slugCode(String(b.code ?? ""));
  const type = b.type === "fixed" ? "fixed" : "percent";
  const value = Math.max(1, Math.floor(Number(b.value) || 0));
  if (!code || value <= 0) {
    return NextResponse.json({ error: "code and a positive value are required" }, { status: 400 });
  }
  if (type === "percent" && value > 100) {
    return NextResponse.json({ error: "percent must be 1-100" }, { status: 400 });
  }

  const minRaw = Number(b.minAed);
  const coupon: Coupon = {
    code,
    type,
    value,
    active: b.active !== false,
    minAed: Number.isFinite(minRaw) && minRaw > 0 ? Math.floor(minRaw) : null,
    expiresAt: b.expiresAt ? String(b.expiresAt) : null,
  };
  saveCoupon(coupon);
  return NextResponse.json({ ok: true, code });
}
