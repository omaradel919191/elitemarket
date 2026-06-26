import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy database client. Returns null when DATABASE_URL is not configured, so
 * the app runs entirely on the in-repo catalog seed until a DB is provisioned
 * (see src/lib/catalog.ts). Wire real queries behind `if (db) { ... }`.
 */

const url = process.env.DATABASE_URL;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (url) {
  const client = postgres(url, { prepare: false });
  _db = drizzle(client, { schema });
}

export const db = _db;
export { schema };
