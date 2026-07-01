import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  if (!rateLimit(`newsletter:${clientIp(req.headers)}`, 15, 10 * 60_000).ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }
    // TODO(persistence): store parsed.data.email in newsletter_subscribers.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
