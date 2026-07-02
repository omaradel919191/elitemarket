"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroParticles } from "./particles";

/**
 * WebGL-grade gold particle hero. A single, GPU-light cinematic screen — the
 * field animates on its own rAF loop (no scroll-scrubbed video, so no stutter)
 * and scales down gracefully on phones. Reduced-motion users keep the static
 * gradient + copy; the particle canvas simply no-ops.
 */
export function HeroCinematic() {
  const t = useTranslations("hero");

  return (
    <section
      aria-label="Elite Market"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#05070f]"
    >
      {/* Deep radial base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_18%,#0f1a34_0%,#080e1e_45%,#04060d_100%)]" />

      {/* Gold particle field */}
      <HeroParticles />

      {/* Cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_72%_at_50%_44%,transparent_48%,rgba(0,0,0,0.72)_100%)]" />

      {/* Copy */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-1.5 text-[0.7rem] font-medium tracking-wide text-gold backdrop-blur-sm">
          {t("eyebrow")}
        </span>
        <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] drop-shadow-[0_4px_40px_rgba(0,0,0,0.85)] sm:text-7xl lg:text-8xl">
          <span className="text-chrome-gradient">{t("titleLine1")}</span>
          <br />
          <span className="text-gold-gradient">{t("titleLine2")}</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm text-ash/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-base">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/shop" size="lg">
            {t("ctaPrimary")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button href="/deals" variant="outline" size="lg">
            {t("ctaSecondary")}
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 text-ash-dim">
        <span className="text-[0.62rem] uppercase tracking-[0.3em]">
          {t("scroll")}
        </span>
        <ChevronDown className="h-4 w-4 animate-bounce text-gold" />
      </div>
    </section>
  );
}
