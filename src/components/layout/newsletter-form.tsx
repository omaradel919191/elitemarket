"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // best-effort; still acknowledge to the user
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-gold">
        <Check className="h-4 w-4" /> {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        autoComplete="email"
        className="h-11 flex-1 rounded-full border border-line bg-surface/60 px-4 text-sm text-chrome placeholder:text-ash-dim focus:border-gold/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label={t("button")}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-soft to-gold-deep text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60 rtl:rotate-180"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
