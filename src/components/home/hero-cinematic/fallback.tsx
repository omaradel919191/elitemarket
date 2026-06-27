import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Hero for small screens and reduced-motion users. Mobile (video=true) gets a
 * lightweight autoplay loop; reduced-motion users get the still image.
 */
export function HeroPoster({ video = false }: { video?: boolean }) {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-black">
      {video ? (
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
          src="/brand/videos/watch.mp4"
          poster="/brand/products/watch.png"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/products/watch.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30" />
      <div className="pointer-events-none absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-black via-black/70 to-transparent" />

      <Container className="relative z-10">
        <div className="max-w-xl text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.05] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.03] sm:text-6xl">
            <span className="text-chrome-gradient">{t("titleLine1")}</span>
            <br />
            <span className="text-gold-gradient">{t("titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ash lg:mx-0">
            {t("subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button href="/shop" size="lg">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button href="/deals" variant="outline" size="lg">
              {t("ctaSecondary")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
