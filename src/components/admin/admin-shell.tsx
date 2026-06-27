import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  BarChart3,
  Newspaper,
  BellRing,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { adminUsesDefaultPassword } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/products/new", label: "Add Product", Icon: Plus },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/coupons", label: "Discount codes", Icon: Tag },
  { href: "/admin/posts", label: "Journal", Icon: Newspaper },
  { href: "/admin/restock", label: "Restock requests", Icon: BellRing },
];

export function AdminShell({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line/70 bg-night px-4 py-6 lg:flex">
        <div className="px-2">
          <span className="font-display text-xl font-semibold text-chrome">
            Elite <span className="text-gold">Market</span>
          </span>
          <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-ash-dim">
            Admin
          </p>
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active === href
                  ? "bg-gold/10 text-gold"
                  : "text-ash hover:bg-surface hover:text-chrome"
              }`}
            >
              <Icon className="h-[1.1rem] w-[1.1rem]" />
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-1 pt-6">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ash transition-colors hover:bg-surface hover:text-chrome"
          >
            <ExternalLink className="h-[1.1rem] w-[1.1rem]" />
            View site
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ash transition-colors hover:bg-surface hover:text-danger"
            >
              <LogOut className="h-[1.1rem] w-[1.1rem]" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-3xl font-semibold text-chrome">
            {title}
          </h1>
          {adminUsesDefaultPassword() && (
            <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              Insecure default password in use. Set{" "}
              <code className="font-mono">ADMIN_PASSWORD</code> and{" "}
              <code className="font-mono">ADMIN_SESSION_SECRET</code> before
              deploying.
            </div>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
