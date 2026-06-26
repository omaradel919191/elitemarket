import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // Always prefix the locale (/en, /ar). "as-needed" leaked the root
  // rewrite-to-/en as a self-redirect in Next's standalone server, looping
  // for every client. "always" makes "/" do a single clean redirect to /en.
  localePrefix: "always",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
