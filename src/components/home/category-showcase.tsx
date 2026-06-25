import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CATEGORIES } from "@/lib/site";

export function CategoryShowcase() {
  const t = useTranslations("home");
  const tc = useTranslations("categories");

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          title={t("categoriesTitle")}
          subtitle={t("categoriesSubtitle")}
        />

        <div className="mt-16 space-y-5">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.slug} delay={i * 0.05}>
                <Link
                  href={`/category/${c.slug}`}
                  className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-line/70 bg-surface/40 p-7 transition-all duration-500 ease-luxe hover:border-gold/30 hover:bg-surface sm:flex-row sm:items-center sm:p-9"
                >
                  <span
                    className="absolute inset-y-0 w-1 origin-top scale-y-0 transition-transform duration-500 ease-luxe ltr:left-0 rtl:right-0 group-hover:scale-y-100"
                    style={{ background: c.accent }}
                  />
                  <div className="flex items-center gap-6">
                    <span className="font-display text-5xl font-semibold text-line transition-colors duration-500 group-hover:text-ash-dim">
                      0{i + 1}
                    </span>
                    <div
                      className="glass flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      style={{ boxShadow: `0 0 44px -12px ${c.accent}66` }}
                    >
                      <Icon
                        className="h-7 w-7"
                        strokeWidth={1.5}
                        style={{ color: c.accent }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold text-chrome transition-colors duration-300 group-hover:text-gold sm:text-3xl">
                      {tc(`${c.slug}.name`)}
                    </h3>
                    <p className="mt-2 text-ash">{tc(`${c.slug}.tagline`)}</p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-medium text-gold">
                    {t("explore")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
