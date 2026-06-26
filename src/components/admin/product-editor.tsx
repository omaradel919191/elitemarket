"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Trash2, Link2, Wand2, Upload, Plus } from "lucide-react";
import { CATEGORIES } from "@/lib/site";
import { getRetailerLink, type Product, type Variant } from "@/lib/catalog-types";

const BADGES = ["", "best-pick", "luxury-deal", "editor-choice"] as const;

function lines(v: string): string[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductEditor({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: Product;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ai, setBusyAi] = useState(false);
  const [msg, setMsg] = useState("");
  const [genUrl, setGenUrl] = useState("");
  const [gen, setGen] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      set("image", data.url);
      setMsg("Image uploaded.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function uploadGalleryImage(file: File) {
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      setF((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(i: number) {
    setF((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  }

  const [f, setF] = useState({
    slug: product?.slug ?? "",
    source: product?.source ?? "own",
    audience: product?.audience ?? "unisex",
    category: product?.category ?? "perfumes",
    stock: product?.stock != null ? String(product.stock) : "",
    brand: product?.brand ?? "ELITE",
    name: product?.name ?? "",
    nameAr: product?.nameAr ?? "",
    blurb: product?.blurb ?? "",
    blurbAr: product?.blurbAr ?? "",
    image: product?.image ?? "/brand/products/perfume.png",
    images: (product?.images ?? []) as string[],
    variants: (product?.variants ?? []) as Variant[],
    priceAed: product?.priceAed != null ? String(product.priceAed) : "",
    wasAed: product?.wasAed != null ? String(product.wasAed) : "",
    rating: product?.rating != null ? String(product.rating) : "",
    deal: product?.deal ?? false,
    badge: product?.badge ?? "",
    bestFor: product?.bestFor ?? "",
    bestForAr: product?.bestForAr ?? "",
    pros: (product?.pros ?? []).join("\n"),
    prosAr: (product?.prosAr ?? []).join("\n"),
    cons: (product?.cons ?? []).join("\n"),
    consAr: (product?.consAr ?? []).join("\n"),
    features: (product?.features ?? []).join("\n"),
    featuresAr: (product?.featuresAr ?? []).join("\n"),
    amazonUrl: product ? (getRetailerLink(product, "amazon")?.url ?? "") : "",
    noonUrl: product ? (getRetailerLink(product, "noon")?.url ?? "") : "",
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  function addVariant() {
    setF((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: crypto.randomUUID(), name: "", priceAed: 0, stock: null },
      ],
    }));
  }
  function updateVariant(i: number, patch: Partial<Variant>) {
    setF((prev) => ({
      ...prev,
      variants: prev.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    }));
  }
  function removeVariant(i: number) {
    setF((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));
  }

  async function aiFill() {
    if (!f.name.trim() || ai) return;
    setBusyAi(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name,
          brand: f.brand,
          category: f.category,
          priceAed: f.priceAed ? Number(f.priceAed) : null,
          notes: f.blurb,
        }),
      });
      const data = await res.json();
      const d = data.draft ?? {};
      setF((prev) => ({
        ...prev,
        nameAr: d.nameAr || prev.nameAr,
        blurb: d.blurb || prev.blurb,
        blurbAr: d.blurbAr || prev.blurbAr,
        bestFor: d.bestFor || prev.bestFor,
        bestForAr: d.bestForAr || prev.bestForAr,
        pros: (d.pros ?? lines(prev.pros)).join("\n"),
        prosAr: (d.prosAr ?? lines(prev.prosAr)).join("\n"),
        cons: (d.cons ?? lines(prev.cons)).join("\n"),
        consAr: (d.consAr ?? lines(prev.consAr)).join("\n"),
        features: (d.features ?? lines(prev.features)).join("\n"),
        featuresAr: (d.featuresAr ?? lines(prev.featuresAr)).join("\n"),
        image: d.image || prev.image,
      }));
      setMsg(data.ai ? "AI filled the copy fields." : "Scaffold filled (set ANTHROPIC_API_KEY for full copy).");
    } catch {
      setMsg("AI fill failed.");
    } finally {
      setBusyAi(false);
    }
  }

  async function generateFromUrl() {
    const u = genUrl.trim();
    if (!u || gen) return;
    setGen(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/generate-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      const d = data.draft ?? {};
      setF((prev) => ({
        ...prev,
        name: d.name || prev.name,
        nameAr: d.nameAr || prev.nameAr,
        brand: d.brand || prev.brand,
        category: d.category || prev.category,
        blurb: d.blurb || prev.blurb,
        blurbAr: d.blurbAr || prev.blurbAr,
        priceAed: d.priceAed != null ? String(d.priceAed) : prev.priceAed,
        badge: d.badge || prev.badge,
        bestFor: d.bestFor || prev.bestFor,
        bestForAr: d.bestForAr || prev.bestForAr,
        pros: (d.pros ?? lines(prev.pros)).join("\n"),
        prosAr: (d.prosAr ?? lines(prev.prosAr)).join("\n"),
        cons: (d.cons ?? lines(prev.cons)).join("\n"),
        consAr: (d.consAr ?? lines(prev.consAr)).join("\n"),
        features: (d.features ?? lines(prev.features)).join("\n"),
        featuresAr: (d.featuresAr ?? lines(prev.featuresAr)).join("\n"),
        image: data.image || prev.image,
        // Generating from an Amazon/Noon link means this is an affiliate product.
        source: "affiliate",
        amazonUrl: data.retailer === "amazon" ? u : prev.amazonUrl,
        noonUrl: data.retailer === "noon" ? u : prev.noonUrl,
      }));
      setMsg(
        data.ai
          ? `Generated from the ${data.retailer} link${data.fetched ? "" : " (page was blocked — please review)"}. Review and Save.`
          : (data.note ?? "Filled from the page — complete the rest."),
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not read that link");
    } finally {
      setGen(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/save-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: f.slug || undefined,
          source: f.source,
          audience: f.audience,
          category: f.category,
          stock: f.stock,
          brand: f.brand,
          name: f.name,
          nameAr: f.nameAr,
          blurb: f.blurb,
          blurbAr: f.blurbAr,
          image: f.image,
          images: f.images,
          variants: f.variants,
          priceAed: f.priceAed,
          wasAed: f.wasAed,
          rating: f.rating,
          deal: f.deal,
          badge: f.badge,
          bestFor: f.bestFor,
          bestForAr: f.bestForAr,
          pros: lines(f.pros),
          prosAr: lines(f.prosAr),
          cons: lines(f.cons),
          consAr: lines(f.consAr),
          features: lines(f.features),
          featuresAr: lines(f.featuresAr),
          amazonUrl: f.amazonUrl,
          noonUrl: f.noonUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!product || !confirm(`Delete "${product.name}"?`)) return;
    setBusy(true);
    await fetch("/api/admin/delete-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: product.slug }),
    });
    router.push("/admin/products");
    router.refresh();
  }

  const field =
    "h-11 w-full rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const area =
    "w-full rounded-xl border border-line bg-night/60 px-3.5 py-2.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const lbl = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-dim";
  const card = "rounded-2xl border border-line/70 bg-surface/40 p-6";

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Generate from a product link */}
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-gold" />
          <h2 className="font-display text-lg font-semibold text-chrome">
            Generate from a product link
          </h2>
        </div>
        <p className="mt-1 text-xs text-ash-dim">
          Paste an Amazon or Noon product URL — the AI reads it and fills the
          name, description, image, price, category and pros/cons. Then review
          and Save. (The link is set as the affiliate link automatically.)
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ash-dim ltr:left-3.5 rtl:right-3.5" />
            <input
              value={genUrl}
              onChange={(e) => setGenUrl(e.target.value)}
              placeholder="https://www.amazon.ae/dp/…  or  https://www.noon.com/…"
              className="h-11 w-full rounded-xl border border-line bg-night/60 text-sm text-chrome focus:border-gold/50 focus:outline-none ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5"
            />
          </div>
          <button
            type="button"
            onClick={generateFromUrl}
            disabled={gen || !genUrl.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            {gen ? "Reading link…" : "Generate"}
          </button>
        </div>
      </div>

      {/* Sale type & audience */}
      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-chrome">
          Sale type & audience
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>How is it sold?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("source", "own")}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  f.source === "own"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-ash hover:border-gold/40"
                }`}
              >
                Own product
                <span className="mt-0.5 block text-[0.65rem] text-ash-dim">
                  Sold here · Stripe + courier
                </span>
              </button>
              <button
                type="button"
                onClick={() => set("source", "affiliate")}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  f.source === "affiliate"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-ash hover:border-gold/40"
                }`}
              >
                Affiliate
                <span className="mt-0.5 block text-[0.65rem] text-ash-dim">
                  Links out to Amazon / Noon
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Audience</label>
            <select
              className={field}
              value={f.audience}
              onChange={(e) => set("audience", e.target.value as typeof f.audience)}
            >
              <option value="men">Men (رجالي)</option>
              <option value="women">Women (نسائي)</option>
              <option value="unisex">Unisex (للجنسين)</option>
            </select>
            <p className="mt-1.5 text-xs text-ash-dim">
              Shown as a filter under its category.
            </p>
          </div>
        </div>
      </div>

      {/* Core */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chrome">Core</h2>
          <button
            type="button"
            onClick={aiFill}
            disabled={ai || !f.name.trim()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/[0.08] disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {ai ? "Filling…" : "AI fill copy"}
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Name (EN)</label>
            <input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <label className={lbl}>Name (AR)</label>
            <input className={field} value={f.nameAr} onChange={(e) => set("nameAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={lbl}>Brand</label>
            <input className={field} value={f.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Category</label>
            <select className={field} value={f.category} onChange={(e) => set("category", e.target.value as typeof f.category)}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Slug {mode === "edit" && "(fixed)"}</label>
            <input className={field} value={f.slug} onChange={(e) => set("slug", e.target.value)} readOnly={mode === "edit"} placeholder="auto from name" />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Cover image</label>
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.image} alt="" className="h-full w-full object-contain p-1" />
              </span>
              <input
                className={field}
                value={f.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="/media/…  or paste an image URL"
              />
              <label className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm text-ash transition-colors hover:border-gold/40 hover:text-gold">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const fl = e.target.files?.[0];
                    if (fl) void uploadImage(fl);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Gallery (extra images)</label>
            <div className="flex flex-wrap items-center gap-3">
              {f.images.map((src, i) => (
                <span
                  key={src + i}
                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-line bg-black"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    aria-label="Remove"
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-black/70 text-danger hover:bg-black"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <label className="inline-flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-xs text-ash transition-colors hover:border-gold/40 hover:text-gold">
                <Upload className="h-4 w-4" />
                Add
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const fl = e.target.files?.[0];
                    if (fl) void uploadGalleryImage(fl);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-ash-dim">
              Shown as thumbnails on the product page (cover stays first).
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Short description (EN)</label>
            <textarea className={area} rows={2} value={f.blurb} onChange={(e) => set("blurb", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Short description (AR)</label>
            <textarea className={area} rows={2} value={f.blurbAr} onChange={(e) => set("blurbAr", e.target.value)} dir="rtl" />
          </div>
        </div>
      </div>

      {/* Pricing & badge */}
      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-chrome">Pricing & badge</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label className={lbl}>
              Price (AED){f.source === "own" && <span className="text-gold"> *</span>}
            </label>
            <input className={field} type="number" value={f.priceAed} onChange={(e) => set("priceAed", e.target.value)} />
          </div>
          {f.source === "own" && (
            <div>
              <label className={lbl}>Stock</label>
              <input
                className={field}
                type="number"
                value={f.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="empty = unlimited"
              />
            </div>
          )}
          <div>
            <label className={lbl}>Was (AED)</label>
            <input className={field} type="number" value={f.wasAed} onChange={(e) => set("wasAed", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Rating</label>
            <input className={field} type="number" step="0.1" max="5" value={f.rating} onChange={(e) => set("rating", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Badge</label>
            <select className={field} value={f.badge} onChange={(e) => set("badge", e.target.value)}>
              {BADGES.map((b) => (
                <option key={b} value={b}>{b || "none"}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ash sm:col-span-4">
            <input type="checkbox" checked={f.deal} onChange={(e) => set("deal", e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
            On deal
          </label>
        </div>
      </div>

      {/* Options / variants — own products only */}
      {f.source === "own" && (
        <div className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-chrome">
              Options / sizes
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/[0.08]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add option
            </button>
          </div>
          <p className="mt-1 text-xs text-ash-dim">
            Optional. Add sizes (e.g. 50ml, 100ml) each with its own price + stock.
            When set, the customer picks one and the base price above shows as “from”.
          </p>
          {f.variants.length > 0 && (
            <div className="mt-4 space-y-2">
              {f.variants.map((v, i) => (
                <div key={v.id} className="grid grid-cols-[1fr_6rem_6rem_auto] items-center gap-2">
                  <input
                    className={field}
                    value={v.name}
                    onChange={(e) => updateVariant(i, { name: e.target.value })}
                    placeholder="50ml"
                  />
                  <input
                    className={field}
                    type="number"
                    value={v.priceAed || ""}
                    onChange={(e) => updateVariant(i, { priceAed: Number(e.target.value) || 0 })}
                    placeholder="Price"
                  />
                  <input
                    className={field}
                    type="number"
                    value={v.stock ?? ""}
                    onChange={(e) =>
                      updateVariant(i, { stock: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder="Stock"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    aria-label="Remove"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ash-dim transition-colors hover:border-danger/40 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Retailer links — affiliate products only */}
      {f.source === "affiliate" && (
        <div className={card}>
          <h2 className="font-display text-lg font-semibold text-chrome">Retailer links</h2>
          <p className="mt-1 text-xs text-ash-dim">Leave empty to show “coming soon”. Affiliate tags are appended automatically.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Amazon URL</label>
              <input className={field} value={f.amazonUrl} onChange={(e) => set("amazonUrl", e.target.value)} placeholder="https://www.amazon.ae/dp/…" />
            </div>
            <div>
              <label className={lbl}>Noon URL</label>
              <input className={field} value={f.noonUrl} onChange={(e) => set("noonUrl", e.target.value)} placeholder="https://www.noon.com/…" />
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div className={card}>
        <h2 className="font-display text-lg font-semibold text-chrome">Details</h2>
        <p className="mt-1 text-xs text-ash-dim">One item per line.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Best for (EN)</label>
            <input className={field} value={f.bestFor} onChange={(e) => set("bestFor", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Best for (AR)</label>
            <input className={field} value={f.bestForAr} onChange={(e) => set("bestForAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={lbl}>Pros (EN)</label>
            <textarea className={area} rows={3} value={f.pros} onChange={(e) => set("pros", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Pros (AR)</label>
            <textarea className={area} rows={3} value={f.prosAr} onChange={(e) => set("prosAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={lbl}>Cons (EN)</label>
            <textarea className={area} rows={2} value={f.cons} onChange={(e) => set("cons", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Cons (AR)</label>
            <textarea className={area} rows={2} value={f.consAr} onChange={(e) => set("consAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={lbl}>Features (EN)</label>
            <textarea className={area} rows={3} value={f.features} onChange={(e) => set("features", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Features (AR)</label>
            <textarea className={area} rows={3} value={f.featuresAr} onChange={(e) => set("featuresAr", e.target.value)} dir="rtl" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || !f.name.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : "Save product"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-danger/40 px-5 text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
        {msg && <span className="text-sm text-ash">{msg}</span>}
      </div>
    </form>
  );
}
