import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveProduct } from "@/lib/catalog";
import type { Badge, Product } from "@/lib/catalog-types";
import { CATEGORIES, type CategorySlug } from "@/lib/site";

const CATS = CATEGORIES.map((c) => c.slug) as string[];
const BADGES: Badge[] = ["best-pick", "luxury-deal", "editor-choice"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return [];
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

  const name = String(b.name ?? "").trim();
  const category = String(b.category ?? "");
  if (!name || !CATS.includes(category)) {
    return NextResponse.json(
      { error: "name and a valid category are required" },
      { status: 400 },
    );
  }

  const brand = String(b.brand ?? "ELITE").trim() || "ELITE";
  const slug = b.slug
    ? slugify(String(b.slug))
    : slugify(`${brand}-${name}`);
  const badge = BADGES.includes(b.badge as Badge) ? (b.badge as Badge) : null;

  const product: Product = {
    slug,
    category: category as CategorySlug,
    brand,
    name,
    nameAr: String(b.nameAr ?? "").trim(),
    blurb: String(b.blurb ?? "").trim(),
    blurbAr: String(b.blurbAr ?? "").trim(),
    image: String(b.image ?? "/brand/products/perfume.png").trim(),
    rating: num(b.rating),
    priceAed: num(b.priceAed),
    deal: !!b.deal,
    wasAed: num(b.wasAed),
    badge,
    bestFor: String(b.bestFor ?? "").trim(),
    bestForAr: String(b.bestForAr ?? "").trim(),
    pros: arr(b.pros),
    prosAr: arr(b.prosAr),
    cons: arr(b.cons),
    consAr: arr(b.consAr),
    features: arr(b.features),
    featuresAr: arr(b.featuresAr),
    links: [
      { retailer: "amazon", url: String(b.amazonUrl ?? "").trim(), priceAed: null },
      { retailer: "noon", url: String(b.noonUrl ?? "").trim(), priceAed: null },
    ],
  };

  saveProduct(product);
  return NextResponse.json({ ok: true, slug });
}
