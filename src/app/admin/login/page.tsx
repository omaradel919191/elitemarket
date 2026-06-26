import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { loginAction } from "../actions";
import { isAdmin, adminUsesDefaultPassword } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="font-display text-3xl font-semibold text-chrome">
            Elite <span className="text-gold">Market</span>
          </span>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-ash-dim">
            Admin
          </p>
        </div>

        <form
          action={loginAction}
          className="mt-8 rounded-2xl border border-line/70 bg-surface/40 p-7"
        >
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-ash"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash-dim" />
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              className="h-12 w-full rounded-full border border-line bg-night/60 pl-10 pr-4 text-chrome focus:border-gold/50 focus:outline-none"
            />
          </div>
          {error && (
            <p className="mt-3 text-sm text-danger">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="mt-5 h-12 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold-deep font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Sign in
          </button>
          {adminUsesDefaultPassword() && (
            <p className="mt-4 text-center text-xs text-ash-dim">
              Dev default password:{" "}
              <code className="font-mono text-gold">elite-admin</code>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
