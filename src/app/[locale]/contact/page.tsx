import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import {
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
} from "@/components/brand/social-icons";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const socials = [
    { href: SITE.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: SITE.social.youtube, Icon: YoutubeIcon, label: "YouTube" },
    { href: SITE.social.tiktok, Icon: TiktokIcon, label: "TikTok" },
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
          <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
            <Reveal className="rounded-2xl border border-line/70 bg-surface/40 p-7">
              <div className="glass flex h-12 w-12 items-center justify-center rounded-xl">
                <Mail className="h-5 w-5 text-gold" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-chrome">
                {t("emailTitle")}
              </h2>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-2 inline-block text-gold transition-colors hover:text-gold-soft"
              >
                {SITE.email}
              </a>
              <p className="mt-2 text-sm text-ash">{t("emailNote")}</p>
            </Reveal>

            <Reveal
              delay={0.06}
              className="rounded-2xl border border-line/70 bg-surface/40 p-7"
            >
              <h2 className="font-display text-lg font-semibold text-chrome">
                {t("socialTitle")}
              </h2>
              <p className="mt-2 text-sm text-ash">{t("socialNote")}</p>
              <div className="mt-5 flex items-center gap-3">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <Icon className="h-[1.05rem] w-[1.05rem]" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
