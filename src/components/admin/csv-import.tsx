"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet } from "lucide-react";

const TEMPLATE =
  "name,nameAr,category,source,audience,priceAed,stock,brand,blurb,blurbAr,image,amazonUrl,noonUrl,badge\n" +
  'Oud Royal,عود رويال,perfumes,own,men,499,20,ELITE,"Deep oud signature","توقيع عودي عميق",,,,best-pick\n' +
  "Gold Aviator,نظارة افياتور,sunglasses,affiliate,unisex,,,ELITE,,,,https://www.amazon.ae/dp/XXXX,,luxury-deal";

export function CsvImport() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: string[] } | null>(null);
  const [err, setErr] = useState("");

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function run() {
    if (!csv.trim() || busy) return;
    setBusy(true);
    setErr("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/import-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "import failed");
      setResult({ imported: data.imported, skipped: data.skipped ?? [] });
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  const card = "rounded-2xl border border-line/70 bg-surface/40 p-6";

  return (
    <div className="space-y-6">
      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-chrome">How it works</h2>
        <p className="mt-2 text-sm text-ash">
          Upload (or paste) a CSV with a header row. Columns: <code className="text-ash-dim">name, nameAr,
          category (perfumes/watches/sunglasses), source (own/affiliate), audience (men/women/unisex),
          priceAed, stock, brand, blurb, blurbAr, image, amazonUrl, noonUrl, badge</code>. Only <code className="text-ash-dim">name</code> is
          required. Existing slugs are overwritten.
        </p>
        <button
          type="button"
          onClick={() => setCsv(TEMPLATE)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-xs text-gold transition-colors hover:bg-gold/[0.08]"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Load example template
        </button>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-chrome">CSV data</h2>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ash transition-colors hover:border-gold/40 hover:text-gold">
            <Upload className="h-4 w-4" />
            Upload .csv
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={10}
          placeholder="name,category,source,priceAed…"
          className="mt-4 w-full rounded-xl border border-line bg-night/60 px-3.5 py-2.5 font-mono text-xs text-chrome focus:border-gold/50 focus:outline-none"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || !csv.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            {busy ? "Importing…" : "Import products"}
          </button>
          {err && <span className="text-sm text-danger">{err}</span>}
        </div>
      </div>

      {result && (
        <div className={card}>
          <p className="text-sm text-success">Imported {result.imported} product(s).</p>
          {result.skipped.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-ash-dim">
              {result.skipped.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          )}
          <a href="/admin/products" className="mt-4 inline-block text-sm text-gold hover:text-gold-soft">
            View products →
          </a>
        </div>
      )}
    </div>
  );
}
