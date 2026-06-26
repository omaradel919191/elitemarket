import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the "middleware" file convention to "proxy".
export default createMiddleware(routing);

export const config = {
  // Run on everything except API, the affiliate out-link redirect (/go),
  // admin (English-only dashboard), Next internals and static files.
  matcher: ["/((?!api|go|admin|_next|_vercel|.*\\..*).*)"],
};
