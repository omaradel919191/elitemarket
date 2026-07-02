import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elite Market — Admin",
  robots: { index: false, follow: false },
};

// Admin routes are auth-gated: never prerender/cache them. Without this the
// requireAdmin() redirect gets statically cached (s-maxage=1yr) and loops
// against /admin/login for a signed-in user.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-ink text-chrome antialiased">{children}</body>
    </html>
  );
}
