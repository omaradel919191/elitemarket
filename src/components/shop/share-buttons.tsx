"use client";

import { useState } from "react";
import { Share2, Link2, Check, MessageCircle } from "lucide-react";

/**
 * Lightweight share row: WhatsApp (big in the UAE), copy link, and the native
 * share sheet (falls back to copy where unsupported). URL + title are passed in
 * so it works without reading window.
 */
export function ShareButtons({
  url,
  title,
  label,
}: {
  url: string;
  title: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    void copy();
  }

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ash-dim">{label}</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={btn}>
        <MessageCircle className="h-4 w-4" />
      </a>
      <button type="button" onClick={copy} aria-label="Copy link" className={btn}>
        {copied ? <Check className="h-4 w-4 text-gold" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button type="button" onClick={share} aria-label={label} className={btn}>
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
