import fs from "node:fs";
import path from "node:path";

/**
 * "Notify me when back in stock" requests, stored in DATA_DIR/restock.json so
 * the owner can see who's waiting for a sold-out product.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const FILE = path.join(DATA_DIR, "restock.json");

export type RestockRequest = { slug: string; email: string; at: string };

function readAll(): RestockRequest[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as RestockRequest[];
  } catch {
    return [];
  }
}

function writeAll(rows: RestockRequest[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(rows, null, 2), "utf8");
}

export function getRestockRequests(): RestockRequest[] {
  return readAll().sort((a, b) => b.at.localeCompare(a.at));
}

export function addRestockRequest(slug: string, email: string): void {
  const e = email.trim().toLowerCase();
  const rows = readAll();
  if (rows.some((r) => r.slug === slug && r.email === e)) return; // dedupe
  rows.push({ slug, email: e, at: new Date().toISOString() });
  writeAll(rows);
}
