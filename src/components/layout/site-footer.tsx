import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/brand/social-icons";
import { NewsletterForm } from "./newsletter-form";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tnews = useTranslations("newsletter");
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("explore"),
      links: [
        { href: "/category/perfumes", label: tn("perfumes") },
        { href: "/category/watches", label: tn("watches") },
        { href: "/category/sunglasses", label: tn("sunglasses") },
        { href: "/category/beauty", label: tn("beauty") },
        { href: "/deals", label: tn("deals") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/contact", label: t("contact") },
        { href: "/blog", label: t("blog") },
        { href: "/guides", label: t("guides") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/affiliate-disclosure", label: t("disclosure") },
        { href: "/privacy", label: t("privacy") },
        { href: "/terms", label: t("terms") },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-line/70 bg-night">
      <div className="gold-rule absolute inset-x-0 top-0" />
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">
              {t("blurb")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
              >
                <InstagramIcon className="h-[1.05rem] w-[1.05rem]" />
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
              >
                <YoutubeIcon className="h-[1.05rem] w-[1.05rem]" />
              </a>
              <a
                href={SITE.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
              >
                <TiktokIcon className="h-[1.05rem] w-[1.05rem]" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-chrome">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ash transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-chrome">
              {tnews("title")}
            </h4>
            <p className="mt-5 text-sm text-ash">{tnews("subtitle")}</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-xl border border-line/70 bg-surface/40 p-4 text-xs leading-relaxed text-ash-dim">
          {t("disclosureNote")}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 text-xs text-ash-dim sm:flex-row">
          <p>
            © {year} {SITE.name}. {t("rights")}
          </p>
          <p className="tracking-wide">{SITE.taglineEn}</p>
        </div>
      </Container>
    </footer>
  );
}
