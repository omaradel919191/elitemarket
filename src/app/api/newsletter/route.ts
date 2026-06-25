import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
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
