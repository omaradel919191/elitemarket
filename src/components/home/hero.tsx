"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Monogram } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const NODE_POS = [
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "top-1/2 ltr:right-0 rtl:left-0 ltr:translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "top-1/2 ltr:left-0 rtl:right-0 ltr:-translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2",
];

export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("categories");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const glowX = useTransform(sx, (v) => v * 26);
  const glowY = useTransform(sy, (v) => v * 26);
  const visX = useTransform(sx, (v) => v * -16);
  const visY = useTransform(sy, (v) => v * -16);

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative flex min-h-dvh items-center overflow-hidden pb-20 pt-28"
    >
      {/* Ambient atmosphere */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="spotlight pointer-events-none absolute inset-0"
      />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 ltr:right-0 rtl:left-0 h-[30rem] w-[30rem] rounded-full bg-primary/40 blur-[120px]" />

      <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="text-center lg:text-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.05] px-4 py-1.5 text-xs font-medium tracking-wide text-gold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.03] sm:text-6xl lg:text-7xl"
          >
            <span className="text-chrome-gradient">{t("titleLine1")}</span>
            <br />
            <span className="text-gold-gradient">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ash lg:mx-0"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button href="/shop" size="lg">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Button>
            <Button href="/deals" variant="outline" size="lg">
              {t("ctaSecondary")}
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line/70 pt-7 lg:mx-0"
          >
            {[
              { v: "80+", k: "statProducts" },
              { v: "4", k: "statCategories" },
              { v: "2", k: "statRetailers" },
            ].map((s) => (
              <div key={s.k} className="text-center lg:text-start">
                <dd className="font-display text-3xl font-semibold text-gold-gradient">
                  {s.v}
                </dd>
                <dt className="mt-1 text-xs tracking-wide text-ash">
                  {t(s.k)}
                </dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Luxury Product Universe */}
        <motion.div
          style={{ x: visX, y: visY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative mx-auto aspect-square w-full max-w-[32rem]"
        >
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-gold/20" />
          <div
            className="absolute inset-[9%] rounded-full border border-dashed border-gold/25"
            style={{ animation: "spin-slow 44s linear infinite" }}
          />
          <div className="absolute inset-[18%] rounded-full border border-line/70" />
          <div className="spotlight absolute inset-[10%] rounded-full" />

          {/* Category nodes */}
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.12, ease: EASE }}
                className={`absolute ${NODE_POS[i]}`}
              >
                <div
                  className="float-slow flex flex-col items-center"
                  style={{ animationDelay: `${i * 0.7}s` }}
                >
                  <div className="glass glow-gold flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full">
                    <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                  </div>
                  <span className="mt-2.5 text-xs font-medium tracking-wide text-ash">
                    {tc(`${c.slug}.name`)}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Center monogram */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="glass glow-gold relative flex h-28 w-28 items-center justify-center rounded-full">
              <div className="sheen absolute inset-0 rounded-full" />
              <Monogram className="h-16 w-16" />
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-2 text-ash-dim"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.25em]">
          {t("scroll")}
        </span>
        <span className="h-9 w-[1.4rem] rounded-full border border-line p-1">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto block h-1.5 w-1.5 rounded-full bg-gold"
          />
        </span>
      </motion.div>
    </section>
  );
}
