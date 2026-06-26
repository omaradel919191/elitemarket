"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, Search, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/shop/cart-button";
import { LanguageSwitcher } from "./language-switcher";
import type { CategorySlug } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ categories }: { categories: CategorySlug[] }) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Nav: Shop · <active categories> · Deals · Journal.
  const nav = useMemo(
    () => [
      { href: "/shop", key: "shop" },
      ...categories.map((slug) => ({ href: `/category/${slug}`, key: slug })),
      { href: "/deals", key: "deals" },
      { href: "/blog", key: "blog" },
    ],
    [categories],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe",
        scrolled
          ? "glass border-b border-gold/10 py-2.5"
          : "border-b border-transparent bg-transparent py-4",
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-ash transition-colors duration-300 hover:text-chrome"
            >
              {t(link.key)}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 ease-luxe group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label={t("search")}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ash transition-colors hover:text-gold sm:flex"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ash transition-colors hover:text-gold sm:flex"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" />
          </Link>
          <CartButton label={t("cart")} />
          <LanguageSwitcher className="ms-1" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("menu")}
            className="ms-1 flex h-10 w-10 items-center justify-center rounded-full text-chrome transition-colors hover:text-gold lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <Container className="flex h-20 items-center justify-between">
              <Logo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-chrome hover:text-gold"
              >
                <X className="h-5 w-5" />
              </button>
            </Container>
            <nav className="mt-6 flex flex-col gap-1 px-6">
              {nav.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line/60 py-4 font-display text-2xl text-chrome transition-colors hover:text-gold"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
