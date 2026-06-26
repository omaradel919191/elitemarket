import { NextResponse, type NextRequest } from "next/server";
import { getProduct, getRetailerLink, type Retailer } from "@/lib/catalog";
import { withAffiliate } from "@/lib/affiliate";

/**
 * Affiliate out-link redirect: /go/<product-slug>?to=amazon|noon
 * Looks up the retailer URL, appends the configured affiliate tag, and 302s
 * to the retailer. We never process payments — this only forwards the user.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const to = (req.nextUrl.searchParams.get("to") as Retailer) || "amazon";

  const product = getProduct(slug);
  const link = product ? getRetailerLink(product, to) : undefined;

  if (!link) {
    return NextResponse.redirect(new URL("/en/shop", req.nextUrl.origin), 302);
  }

  const dest = withAffiliate(link.url, to);
  const res = NextResponse.redirect(dest, 302);
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
