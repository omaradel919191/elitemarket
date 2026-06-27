"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";

export function NotifyRestock({
  slug,
  labels,
}: {
  slug: string;
  labels: { title: string; text: string; placeholder: string; button: string; done: string };
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      await fetch("/api/notify-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email }),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line/70 bg-surface/40 p-5">
      <p className="text-sm font-semibold text-ash-dim">{labels.title}</p>
      {done ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-gold">
          <Check className="h-4 w-4" />
          {labels.done}
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-ash">{labels.text}</p>
          <form onSubmit={submit} className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.placeholder}
              className="h-11 flex-1 rounded-xl border border-line bg-night/60 px-3.5 text-sm text-chrome focus:border-gold/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              <BellRing className="h-4 w-4" />
              {labels.button}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
