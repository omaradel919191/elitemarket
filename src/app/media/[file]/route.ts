import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * Serves admin-uploaded images from ${DATA_DIR}/uploads (the persistent
 * volume). Path is restricted to the uploads dir (no traversal).
 */

const UPLOAD_DIR = path.join(
  process.env.DATA_DIR || path.join(process.cwd(), "content"),
  "uploads",
);
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ file: string }> },
) {
  const { file } = await ctx.params;
  const safe = path.basename(file); // strip any path traversal
  const full = path.join(UPLOAD_DIR, safe);
  if (!full.startsWith(UPLOAD_DIR + path.sep) || !fs.existsSync(full)) {
    return new NextResponse("not found", { status: 404 });
  }
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const buf = fs.readFileSync(full);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
