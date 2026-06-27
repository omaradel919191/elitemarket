"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Package, Search } from "lucide-react";
import { formatAED } from "@/lib/utils";

type Result = {
  found: boolean;
  status?: string;
  createdAt?: string;
  trackingNumber?: string | null;
  itemsCount?: number;
  amountAed?: number;
};

export function TrackForm({ locale }: { locale: string }) {
  const t = useTranslations("track");
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !ref.trim() || !email.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, email }),
      });
      setResult(await res.json());
    } catch {
      setResult({ found: false });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "h-12 w-full rounded-xl border border-line bg-night/60 px-4 text-sm text-chrome focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={track} className="space-y-3">
        <input
          className={field}
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder={t("ref")}
        />
        <input
          className={field}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email")}
        />
        <button
          type="submit"
          disabled={busy || !ref.trim() || !email.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 h-12 text-sm font-medium text-ink bg-gradient-to-b from-gold-soft to-gold-deep transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Search className="h-4 w-4" />
          {busy ? t("checking") : t("button")}
        </button>
      </form>

      {result && !result.found && (
        <p className="mt-6 rounded-xl border border-line/70 bg-surface/40 px-4 py-4 text-center text-sm text-ash">
          {t("notFound")}
        </p>
      )}

      {result && result.found && (
        <div className="mt-6 rounded-2xl border border-gold/25 bg-surface/40 p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-gold" />
            <span className="font-display text-xl font-semibold text-gold">
              {t(`statuses.${result.status}`)}
            </span>
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ash">{t("placed")}</dt>
              <dd className="text-chrome">{result.createdAt?.slice(0, 10)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ash">{t("items")}</dt>
              <dd className="text-chrome">{result.itemsCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ash">{t("total")}</dt>
              <dd className="text-chrome">{formatAED(result.amountAed ?? 0, locale)}</dd>
            </div>
            {result.trackingNumber && (
              <div className="flex justify-between">
                <dt className="text-ash">{t("tracking")}</dt>
                <dd className="font-mono text-chrome">{result.trackingNumber}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
