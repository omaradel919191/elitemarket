import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/admin-auth";

/**
 * Admin image upload. Saves to ${DATA_DIR}/uploads (the persistent volume) and
 * returns a same-origin URL served by /media/<file>. Admin-guarded.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "content");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported type — use JPG, PNG, WebP or AVIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 6 MB)" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    return NextResponse.json({ ok: true, url: `/media/${name}` });
  } catch {
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }
}
