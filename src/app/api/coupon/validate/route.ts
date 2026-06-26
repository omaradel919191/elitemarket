import { NextResponse, type NextRequest } from "next/server";
import {
  getProduct,
  hasVariants,
  variantById,
  resolveUnit,
} from "@/lib/catalog";
import { validateCoupon } from "@/lib/coupons";

/**
 * Validate a discount code for the current cart. Public — the subtotal is
 * recomputed from the catalog (the client can't inflate it). Returns the
 * discount so the cart can show the new total; checkout re-validates anyway.
 */
export async function POST(req: NextRequest) {
  let body: { code?: string; lines?: { slug: string; qty: number; variantId?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  let subtotal = 0;
  for (const line of body.lines ?? []) {
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line?.qty) || 0)));
    const product = getProduct(String(line?.slug ?? ""));
    if (!product || product.source !== "own" || qty < 1) continue;
    const variantId = line?.variantId ? String(line.variantId) : undefined;
    if (hasVariants(product) && !variantById(product, variantId)) continue;
    const unit = resolveUnit(product, variantId);
    if (unit.priceAed && unit.priceAed > 0) subtotal += unit.priceAed * qty;
  }

  const result = validateCoupon(String(body.code ?? ""), subtotal);
  return NextResponse.json(result);
}
