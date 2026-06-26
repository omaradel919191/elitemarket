import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { saveProduct } from "@/lib/catalog";
import {
  normalizeProduct,
  AUDIENCES,
  type Audience,
  type Badge,
  type ProductSource,
} from "@/lib/catalog-types";
import { CATEGORIES, type CategorySlug } from "@/lib/site";

/**
 * Bulk-import products from CSV. Admin-guarded. Header row (case-insensitive)
 * may include: name, nameAr, category, source, audience, priceAed, stock, brand,
 * blurb, blurbAr, image, amazonUrl, noonUrl, badge, slug.
 */

const CATS = CATEGORIES.map((c) => c.slug) as string[];
const BADGES: Badge[] = ["best-pick", "luxury-deal", "editor-choice"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function num(v: string): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\r") {
      /* skip */
    } else if (ch === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { csv?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const rows = parseCSV(String(body.csv ?? ""));
  if (rows.length < 2) {
    return NextResponse.json({ error: "Need a header row + at least one product" }, { status: 400 });
  }

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
  const idx: Record<string, number> = {};
  header.forEach((h, i) => (idx[h] = i));

  let imported = 0;
  const skipped: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const get = (k: string) => (idx[k] != null ? (cols[idx[k]] ?? "").trim() : "");

    const name = get("name");
    if (!name) { skipped.push(`Row ${r + 1}: no name`); continue; }

    let category = get("category").toLowerCase() as CategorySlug;
    if (!CATS.includes(category)) category = "perfumes";
    const source: ProductSource = get("source").toLowerCase() === "own" ? "own" : "affiliate";
    const aud = get("audience").toLowerCase();
    const audience: Audience = AUDIENCES.includes(aud as Audience) ? (aud as Audience) : "unisex";
    const brand = get("brand") || "ELITE";
    const badgeRaw = get("badge").toLowerCase();
    const badge = BADGES.includes(badgeRaw as Badge) ? (badgeRaw as Badge) : null;
    const slug = slugify(get("slug") || `${brand}-${name}`);

    const product = normalizeProduct({
      slug,
      source,
      audience,
      category,
      brand,
      name,
      nameAr: get("namear"),
      blurb: get("blurb"),
      blurbAr: get("blurbar"),
      image: get("image") || "/brand/products/perfume.png",
      priceAed: num(get("priceaed") || get("price")),
      stock: num(get("stock")),
      badge,
      links:
        source === "affiliate"
          ? [
              { retailer: "amazon", url: get("amazonurl"), priceAed: null },
              { retailer: "noon", url: get("noonurl"), priceAed: null },
            ]
          : [],
    });
    saveProduct(product);
    imported++;
  }

  return NextResponse.json({ ok: true, imported, skipped });
}
