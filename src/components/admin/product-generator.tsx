"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/site";

type Draft = Record<string, unknown> & { name?: string; _note?: string };

export function ProductGenerator() {
  const [form, setForm] = useState({
    name: "",
    brand: "ELITE",
    category: "perfumes",
    priceAed: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ai, setAi] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || busy) return;
    setBusy(true);
    setErr("");
    setDraft(null);
    try {
      const res = await fetch("/api/admin/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          category: form.category,
          priceAed: form.priceAed ? Number(form.priceAed) : null,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setDraft(data.draft);
      setAi(data.ai);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  const json = draft ? JSON.stringify(draft, null, 2) : "";
  const field =
    "h-11 w-full rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-dim";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={generate}
        className="rounded-2xl border border-line/70 bg-surface/40 p-6"
      >
        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className={field}
              placeholder="Noir Extrait de Parfum"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="brand">
                Brand
              </label>
              <input
                id="brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="price">
              Indicative price (AED)
            </label>
            <input
              id="price"
              type="number"
              value={form.priceAed}
              onChange={(e) => set("priceAed", e.target.value)}
              className={field}
              placeholder="420"
            />
          </div>
          <div>
            <label className={label} htmlFor="notes">
              Notes for the AI
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-line bg-night/60 px-3.5 py-2.5 text-sm text-chrome focus:border-gold/50 focus:outline-none"
              placeholder="Amber + oud, long-lasting, for evenings…"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy || !form.name.trim()}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          {busy ? "Generating…" : "Generate draft"}
        </button>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      </form>

      <div className="rounded-2xl border border-line/70 bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chrome">
            Draft
          </h2>
          {draft && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(json);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ash transition-colors hover:border-gold/40 hover:text-gold"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          )}
        </div>

        {!draft && (
          <p className="mt-4 text-sm text-ash-dim">
            Fill the form and generate a bilingual product draft. Copy the JSON
            into <code className="font-mono">src/lib/catalog.ts</code> (or your
            DB) and add the retailer links.
          </p>
        )}

        {ai === false && (
          <p className="mt-4 rounded-lg border border-line/70 bg-night/40 px-3 py-2 text-xs text-ash-dim">
            Scaffold only — set <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
            for full bilingual copy.
          </p>
        )}

        {draft && (
          <pre className="mt-4 max-h-[28rem] overflow-auto rounded-xl border border-line/70 bg-night/60 p-4 text-xs leading-relaxed text-ash">
            {json}
          </pre>
        )}
      </div>
    </div>
  );
}
