import { useTranslations } from "next-intl";
import { Award, BadgeCheck, ShieldCheck, Languages } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function ValueProps() {
  const t = useTranslations("home");

  const values = [
    { icon: Award, title: t("valueCuration"), body: t("valueCurationBody") },
    { icon: BadgeCheck, title: t("valueHonest"), body: t("valueHonestBody") },
    { icon: ShieldCheck, title: t("valueTrusted"), body: t("valueTrustedBody") },
    {
      icon: Languages,
      title: t("valueBilingual"),
      body: t("valueBilingualBody"),
    },
  ];

  return (
    <section className="relative border-t border-line/50 py-24 sm:py-32">
      <Container>
        <SectionHeading title={t("trustTitle")} />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-line/70 bg-surface/40 p-7 text-center transition-all duration-500 ease-luxe hover:border-gold/30 hover:bg-surface">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-chrome">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-ash">{v.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
