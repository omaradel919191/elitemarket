/**
 * Escape characters that could break out of a <script> block or corrupt the
 * embedded JSON. Product/blog fields flow in here from admin input and scraped
 * pages, so `</script>`, HTML comment openers and the JS line separators must
 * be neutralised even though the payload is JSON.
 */
function safeJson(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Renders a JSON-LD <script> for structured data (SEO / rich results). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  );
}
