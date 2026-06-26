"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag } from "lucide-react";
import type { Coupon } from "@/lib/coupons";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    minAed: "",
    expiresAt: "",
    active: true,
  });

  const field =
    "h-11 w-full rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none";
  const lbl = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-dim";

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.code.trim() || !f.value || busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/save-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: f.code,
          type: f.type,
          value: Number(f.value),
          minAed: f.minAed ? Number(f.minAed) : null,
          expiresAt: f.expiresAt || null,
          active: f.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setF({ code: "", type: "percent", value: "", minAed: "", expiresAt: "", active: true });
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(code: string) {
    if (!confirm(`Delete code ${code}?`)) return;
    await fetch("/api/admin/delete-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="rounded-2xl border border-line/70 bg-surface/40 p-6">
        <h2 className="font-display text-lg font-semibold text-chrome">New discount code</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={lbl}>Code</label>
            <input
              className={field}
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
              placeholder="EID20"
            />
          </div>
          <div>
            <label className={lbl}>Type</label>
            <select
              className={field}
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value as "percent" | "fixed" })}
            >
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed AED</option>
            </select>
          </div>
          <div>
            <label className={lbl}>{f.type === "percent" ? "Percent (1-100)" : "Amount (AED)"}</label>
            <input
              className={field}
              type="number"
              value={f.value}
              onChange={(e) => setF({ ...f, value: e.target.value })}
            />
          </div>
          <div>
            <label className={lbl}>Min subtotal (AED, optional)</label>
            <input
              className={field}
              type="number"
              value={f.minAed}
              onChange={(e) => setF({ ...f, minAed: e.target.value })}
            />
          </div>
          <div>
            <label className={lbl}>Expires (optional)</label>
            <input
              className={field}
              type="date"
              value={f.expiresAt}
              onChange={(e) => setF({ ...f, expiresAt: e.target.value })}
            />
          </div>
          <label className="flex items-end gap-2 pb-2.5 text-sm text-ash">
            <input
              type="checkbox"
              checked={f.active}
              onChange={(e) => setF({ ...f, active: e.target.checked })}
              className="h-4 w-4 accent-[#d4af37]"
            />
            Active
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !f.code.trim() || !f.value}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add code
          </button>
          {msg && <span className="text-sm text-danger">{msg}</span>}
        </div>
      </form>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-line/70 bg-surface/30 px-6 py-12 text-center text-ash">
          <Tag className="mx-auto h-6 w-6 text-ash-dim" />
          <p className="mt-3">No discount codes yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line/70">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-ash-dim">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-line/50 last:border-0 hover:bg-surface/40">
                  <td className="px-4 py-3 font-mono font-medium text-chrome">{c.code}</td>
                  <td className="px-4 py-3 text-ash">
                    {c.type === "percent" ? `${c.value}%` : `${c.value} AED`}
                  </td>
                  <td className="px-4 py-3 text-ash">{c.minAed ? `${c.minAed} AED` : "—"}</td>
                  <td className="px-4 py-3 text-ash">{c.expiresAt || "—"}</td>
                  <td className="px-4 py-3">
                    {c.active ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs text-ash-dim">Off</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(c.code)}
                      aria-label="Delete"
                      className="text-ash-dim transition-colors hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
