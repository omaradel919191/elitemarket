import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function CtaBand() {
  const t = useTranslations("home");

  return (
    <section className="relative py-12 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-primary via-night to-ink px-7 py-16 text-center sm:px-16 sm:py-20">
            <div className="spotlight absolute inset-0" />
            <div
              className="pointer-events-none absolute -top-24 h-64 w-64 rounded-full border border-dashed border-gold/15 ltr:-right-24 rtl:-left-24"
              style={{ animation: "spin-slow 50s linear infinite" }}
            />
            <h2 className="relative font-display text-3xl font-semibold text-chrome sm:text-4xl lg:text-5xl">
              {t("ctaTitle")}
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-ash">
              {t("ctaBody")}
            </p>
            <div className="relative mt-9 flex justify-center">
              <Button href="/shop" size="lg">
                {t("ctaButton")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
