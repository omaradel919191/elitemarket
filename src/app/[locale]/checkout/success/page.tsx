import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { CartClearer } from "@/components/shop/cart-clearer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "success" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("success");

  return (
    <section className="pt-36 pb-32 sm:pt-44">
      <CartClearer />
      <Container className="max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06]">
          <CheckCircle2 className="h-8 w-8 text-gold" />
        </span>
        <h1 className="mt-8 font-display text-3xl font-semibold text-chrome sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ash">{t("body")}</p>
        {session_id && (
          <p className="mt-3 text-xs text-ash-dim">
            {t("orderRef")}: <span className="font-mono">{session_id.slice(-12)}</span>
          </p>
        )}
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep px-7 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          {t("continue")}
        </Link>
      </Container>
    </section>
  );
}
