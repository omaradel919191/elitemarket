import type { ReactNode } from "react";

// The real <html>/<body> live in src/app/[locale]/layout.tsx so that the
// document can carry the correct lang + dir per locale. This root layout is a
// required pass-through for the App Router.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
