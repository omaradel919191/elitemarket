import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Monogram } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/site";

const NODE_POS = [
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "top-1/2 ltr:right-0 rtl:left-0 ltr:translate-x-1/2 rtl:-translate-x-1/2 -translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "top-1/2 ltr:left-0 rtl:right-0 ltr:-translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2",
];

/** Lightweight, motion-free hero for reduced-motion users and small screens. */
export function HeroStatic() {
  const t = useTranslations("hero");
  const tc = useTranslations("categories");

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden pb-16 pt-28">
      <div className="spotlight pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />
      <Container className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.05] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.03] sm:text-6xl">
            <span className="text-chrome-gradient">{t("titleLine1")}</span>
            <br />
            <span className="text-gold-gradient">{t("titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ash lg:mx-0">
            {t("subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button href="/shop" size="lg">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button href="/deals" variant="outline" size="lg">
              {t("ctaSecondary")}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
          <div className="absolute inset-0 rounded-full border border-gold/20" />
          <div className="absolute inset-[14%] rounded-full border border-dashed border-gold/20" />
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={c.slug} className={`absolute ${NODE_POS[i]}`}>
                <div className="glass glow-gold flex h-16 w-16 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="glass glow-gold flex h-24 w-24 items-center justify-center rounded-full">
              <Monogram className="h-14 w-14" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
