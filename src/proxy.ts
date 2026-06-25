import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the "middleware" file convention to "proxy".
export default createMiddleware(routing);

export const config = {
  // Run on everything except API, admin (English-only dashboard),
  // Next internals and static files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
