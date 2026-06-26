import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ShieldCheck, Star, ExternalLink, Languages } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { Icon: Star, title: t("v1Title"), body: t("v1Body") },
    { Icon: ShieldCheck, title: t("v2Title"), body: t("v2Body") },
    { Icon: ExternalLink, title: t("v3Title"), body: t("v3Body") },
    { Icon: Languages, title: t("v4Title"), body: t("v4Body") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <section className="pb-28">
        <Container>
          <Reveal className="max-w-2xl space-y-6 text-base leading-relaxed text-ash">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
          </Reveal>

          <h2 className="mt-20 font-display text-2xl font-semibold text-chrome">
            {t("valuesTitle")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 0.05}
                className="rounded-2xl border border-line/70 bg-surface/40 p-6"
              >
                <div className="glass flex h-12 w-12 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-chrome">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ash">{body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
