import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Inter,
  Cormorant_Garamond,
  Tajawal,
  El_Messiri,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { AmbientGold } from "@/components/brand/ambient-gold";
import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Analytics } from "@/components/seo/analytics";
import { SITE } from "@/lib/site";
import { getActiveCategorySlugs } from "@/lib/catalog";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});
const elMessiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-el-messiri",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Render at request time so runtime env (e.g. WHATSAPP_NUMBER) and live catalog
// changes are reflected on every page, including the home + content pages.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL("https://eliteperfumeuae.com"),
    title: { default: t("title"), template: `%s — ${t("brand")}` },
    description: t("description"),
    applicationName: t("brand"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: t("brand"),
      title: t("title"),
      description: t("description"),
      locale: locale === "ar" ? "ar_AE" : "en_US",
      url: `/${locale}`,
      images: [{ url: "/brand/cover.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/brand/cover.png"],
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const categories = getActiveCategorySlugs();
  const whatsapp = process.env.WHATSAPP_NUMBER?.trim();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cormorant.variable} ${tajawal.variable} ${elMessiri.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-ink text-chrome antialiased">
        <Analytics
          gaId={process.env.NEXT_PUBLIC_GA_ID?.trim()}
          pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            logo: `${SITE.url}/brand/em-logo.png`,
            sameAs: [
              SITE.social.instagram,
              SITE.social.youtube,
              SITE.social.tiktok,
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.url,
            inLanguage: ["en", "ar"],
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE.url}/en/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <NextIntlClientProvider>
          <SmoothScroll />
          <AmbientGold />
          <div
            aria-hidden
            className="grain pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-overlay"
          />
          <SiteHeader categories={categories} />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
          <AssistantWidget />
          {whatsapp && (
            <WhatsAppButton
              number={whatsapp}
              label="WhatsApp"
              message={
                locale === "ar"
                  ? "مرحبا، عندي سؤال عن منتجاتكم"
                  : "Hi, I have a question about your products"
              }
            />
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
