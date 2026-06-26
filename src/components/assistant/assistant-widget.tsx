"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Sparkles, X, ArrowUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatAED } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Rec = {
  slug: string;
  name: string;
  image: string;
  priceAed: number | null;
  category: string;
};
type Msg = { role: "user" | "assistant"; content: string; products?: Rec[] };

export function AssistantWidget() {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ role: "assistant", content: t("greeting") }]);
    }
  }, [open, msgs.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const history = msgs.map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale, history }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? t("error"), products: data.products },
      ]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: t("error") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("title")}
        className="group fixed bottom-6 z-50 flex h-14 items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-5 text-ink shadow-[0_12px_40px_-10px_rgba(212,175,55,0.7)] transition-transform hover:-translate-y-0.5 ltr:right-6 rtl:left-6"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold">{t("fab")}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 z-50 flex h-[32rem] max-h-[75vh] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gold/20 bg-night/95 shadow-2xl backdrop-blur-xl ltr:right-6 rtl:left-6">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="font-display text-base font-semibold text-chrome">
                {t("title")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="text-ash transition-colors hover:text-gold"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gold/15 text-chrome"
                      : "bg-surface text-ash",
                  )}
                >
                  <p>{m.content}</p>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/product/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-line/70 bg-night/60 p-2 transition-colors hover:border-gold/40"
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-chrome">
                              {p.name}
                            </span>
                            {p.priceAed != null && (
                              <span className="text-xs text-gold">
                                {formatAED(p.priceAed, locale)}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-sm text-ash-dim">{t("thinking")}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="border-t border-line/70 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                aria-label={t("title")}
                className="h-11 flex-1 rounded-full border border-line bg-surface/60 px-4 text-sm text-chrome placeholder:text-ash-dim focus:border-gold/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label={t("send")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-soft to-gold-deep text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              >
                <ArrowUp className="h-5 w-5 rtl:rotate-0" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[0.65rem] text-ash-dim">{t("disclaimer")}</p>
          </form>
        </div>
      )}
    </>
  );
}
