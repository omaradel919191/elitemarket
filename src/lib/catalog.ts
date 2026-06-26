import fs from "node:fs";
import path from "node:path";
import { LAUNCH_PRODUCTS } from "@/data/launch-products";
import type { CategorySlug } from "./site";
import type { Product } from "./catalog-types";

/**
 * Server-only catalog data access, backed by a JSON file so the admin can edit
 * products at runtime. Reads/writes `${DATA_DIR}/products.json` (DATA_DIR
 * defaults to ./content). On first run the file is seeded from the launch set.
 * Mount DATA_DIR as a volume in production so admin edits persist across
 * redeploys. Client components must import from catalog-types, not this file.
 */

// Re-export client-safe types + pure helpers for server consumers.
export * from "./catalog-types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const FILE = path.join(DATA_DIR, "products.json");

function ensureFile(): void {
  try {
    if (!fs.existsSync(FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify(LAUNCH_PRODUCTS, null, 2), "utf8");
    }
  } catch {
    // Read-only filesystem — readAll() falls back to the bundled launch set.
  }
}

function readAll(): Product[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Product[];
  } catch {
    return LAUNCH_PRODUCTS;
  }
}

function writeAll(products: Product[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2), "utf8");
}

export function getAllProducts(): Product[] {
  return readAll();
}

export function getProduct(slug: string): Product | undefined {
  return readAll().find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return readAll().filter((p) => p.category === category);
}

export function getDeals(): Product[] {
  return readAll().filter((p) => p.deal);
}

export function getRelated(product: Product, limit = 3): Product[] {
  return readAll()
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return readAll().filter((p) =>
    [p.name, p.nameAr, p.brand, p.blurb, p.blurbAr, p.category]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

// ── Admin CRUD ──────────────────────────────────────────────────────────────

export function saveProduct(product: Product): void {
  const all = readAll();
  const i = all.findIndex((p) => p.slug === product.slug);
  if (i >= 0) all[i] = product;
  else all.push(product);
  writeAll(all);
}

export function deleteProduct(slug: string): void {
  writeAll(readAll().filter((p) => p.slug !== slug));
}
