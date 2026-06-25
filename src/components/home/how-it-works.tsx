import { useTranslations } from "next-intl";
import { Gem, Scale, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function HowItWorks() {
  const t = useTranslations("home");

  const steps = [
    { icon: Gem, title: t("step1Title"), body: t("step1Body") },
    { icon: Scale, title: t("step2Title"), body: t("step2Body") },
    { icon: ExternalLink, title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section className="relative border-t border-line/50 py-24 sm:py-32">
      <Container>
        <SectionHeading title={t("howTitle")} subtitle={t("howSubtitle")} />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="group relative h-full rounded-2xl border border-line/70 bg-surface/40 p-8 transition-all duration-500 ease-luxe hover:border-gold/30 hover:bg-surface">
                  <span className="font-display text-6xl font-semibold leading-none text-line transition-colors duration-500 group-hover:text-ash-dim">
                    0{i + 1}
                  </span>
                  <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-chrome">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
