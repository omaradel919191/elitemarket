/**
 * Renders a post body: blank-line-separated paragraphs, and lines starting with
 * "## " become headings. Plain-text only (no HTML injection), so it's safe.
 */
export function PostBody({ body, dir }: { body: string; dir?: "rtl" | "ltr" }) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div dir={dir} className="space-y-5">
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2
            key={i}
            className="font-display text-2xl font-semibold text-chrome"
          >
            {block.slice(3).trim()}
          </h2>
        ) : (
          <p key={i} className="whitespace-pre-line leading-relaxed text-ash">
            {block}
          </p>
        ),
      )}
    </div>
  );
}
