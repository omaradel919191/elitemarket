import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Monogram } from "@/components/brand/logo";
import {
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
} from "@/components/brand/social-icons";
import { BioSearch } from "@/components/home/bio-search";
import { getAllProducts, getActiveCategories } from "@/lib/catalog";
import { localized, publicPrice, toCardProduct } from "@/lib/catalog-types";
import { formatAED } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  return { title: t("title"), description: t("subtitle") };
}

/**
 * Link-in-bio landing page. Instagram/TikTok only allow one clickable link (in
 * the bio), so this is the single destination to put there: a fast, mobile-first
 * hub with search, category shortcuts and the most recently added products
 * (what's usually being advertised) surfaced first — so a follower who saw a
 * reel can reach that product in one or two taps.
 */
export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("links");
  const tc = await getTranslations("categories");

  const categories = getActiveCategories();
  // Importer appends new products, so reverse = newest first (what's advertised).
  const latest = [...getAllProducts()].reverse().slice(0, 8).map(toCardProduct);
  const wa = (process.env.WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");

  const socials = [
    { href: SITE.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: SITE.social.tiktok, Icon: TiktokIcon, label: "TikTok" },
    { href: SITE.social.youtube, Icon: YoutubeIcon, label: "YouTube" },
  ];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 pb-20 pt-28">
      {/* Brand */}
      <div className="flex flex-col items-center text-center">
        <Monogram className="h-14 w-14" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-chrome">
          {SITE.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ash">{t("subtitle")}</p>
      </div>

      {/* Search — primary action */}
      <div className="mt-7">
        <BioSearch />
      </div>

      {/* Category shortcuts */}
      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-ash-dim">
        {t("categories")}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line/70 bg-surface/40 py-4 text-center transition-colors hover:border-gold/30 hover:bg-surface"
            >
              <Icon className="h-6 w-6" strokeWidth={1.5} style={{ color: c.accent }} />
              <span className="text-xs font-medium text-ash">
                {tc(`${c.slug}.name`)}
              </span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/shop"
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-2xl border border-gold/35 bg-gold/[0.06] py-3.5 text-sm font-medium text-gold transition-colors hover:bg-gold/[0.12]"
      >
        {t("browseAll")}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Link>

      {/* Just added — surfaces what's being advertised */}
      {latest.length > 0 && (
        <>
          <p className="mt-9 text-xs font-semibold uppercase tracking-wider text-ash-dim">
            {t("latest")}
          </p>
          <div className="mt-3 space-y-2.5">
            {latest.map((p) => {
              const l = localized(p, locale);
              const price = publicPrice(p);
              return (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line/70 bg-surface/40 p-2.5 transition-colors hover:border-gold/30 hover:bg-surface"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
                    <Image
                      src={p.image}
                      alt={l.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gold">
                      {p.brand}
                    </span>
                    <span className="line-clamp-1 text-sm font-medium text-chrome">
                      {l.name}
                    </span>
                    {price != null ? (
                      <span className="mt-0.5 block text-sm text-ash">
                        {formatAED(price, locale)}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs font-medium text-gold">
                        {locale === "ar"
                          ? "شوف السعر على أمازون"
                          : "See price on Amazon"}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ash-dim transition-colors group-hover:text-gold rtl:rotate-180" />
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Contact + social */}
      <div className="mt-9 space-y-2.5">
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-5 w-5" />
            {t("whatsapp")}
          </a>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          {socials.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-gold/40 hover:text-gold"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
