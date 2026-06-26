import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

/**
 * Generate a bilingual Journal article from a topic. Uses Claude when
 * ANTHROPIC_API_KEY is set, otherwise returns an empty scaffold so the admin can
 * write manually. Admin-guarded.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { topic?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const topic = (body.topic ?? "").trim();
  if (!topic) {
    return NextResponse.json({ error: "Enter a topic" }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({
      ai: false,
      draft: {
        title: topic,
        titleAr: "",
        excerpt: "",
        excerptAr: "",
        body: "",
        bodyAr: "",
      },
      note: "AI not configured — write the article manually.",
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });
    const system =
      `You are the editorial writer for Elite Market, a curated luxury store in the UAE ` +
      `(perfumes, watches, sunglasses). Write a polished, genuinely useful Journal article ` +
      `on the given topic — a buying guide, edit, or story. Premium, specific and honest; no hype, ` +
      `no invented facts. Arabic must use NO tashkeel (no diacritics). ` +
      `The body should be 4-7 short paragraphs; you may use "## " lines as section headings. ` +
      `Return ONLY a JSON object, no markdown, with keys: ` +
      `{"title","titleAr","excerpt"(<=160 chars),"excerptAr","body","bodyAr"}.`;

    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: `Topic: ${topic}` }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const ai = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    return NextResponse.json({
      ai: true,
      draft: {
        title: ai.title ?? topic,
        titleAr: ai.titleAr ?? "",
        excerpt: ai.excerpt ?? "",
        excerptAr: ai.excerptAr ?? "",
        body: ai.body ?? "",
        bodyAr: ai.bodyAr ?? "",
      },
    });
  } catch {
    return NextResponse.json({
      ai: false,
      draft: { title: topic, titleAr: "", excerpt: "", excerptAr: "", body: "", bodyAr: "" },
      note: "AI generation failed — write manually.",
    });
  }
}
