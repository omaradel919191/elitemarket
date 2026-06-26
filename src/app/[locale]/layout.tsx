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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL("https://eliteperfumesuae.com"),
    title: { default: t("title"), template: `%s — ${t("brand")}` },
    description: t("description"),
    applicationName: t("brand"),
    alternates: {
      canonical: locale === "ar" ? "/ar" : "/",
      languages: { en: "/", ar: "/ar", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: t("brand"),
      title: t("title"),
      description: t("description"),
      locale: locale === "ar" ? "ar_AE" : "en_US",
      url: locale === "ar" ? "/ar" : "/",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
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

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cormorant.variable} ${tajawal.variable} ${elMessiri.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-ink text-chrome antialiased">
        <NextIntlClientProvider>
          <SmoothScroll />
          <AmbientGold />
          <div
            aria-hidden
            className="grain pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-overlay"
          />
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
