import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

/**
 * Minimal admin auth for the English-only dashboard. The admin only manages
 * example catalog data and generates drafts — no payments or customer data —
 * so a single shared password (ADMIN_PASSWORD) gated by a signed cookie is
 * sufficient. Set ADMIN_PASSWORD + ADMIN_SESSION_SECRET before deploying.
 */

const COOKIE = "em_admin";
const DEV_PASSWORD = "elite-admin";
const DEV_SECRET = "elite-market-dev-secret-change-me";

const isProd = process.env.NODE_ENV === "production";
const configuredPassword = process.env.ADMIN_PASSWORD;
const configuredSecret =
  process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET;

/**
 * Fail closed: in production we never fall back to the shipped dev defaults.
 * If either the password or the signing secret is missing, admin auth is
 * disabled entirely (no login accepted, no session validated) rather than
 * left open behind a publicly-known password/secret.
 */
const authDisabled = isProd && (!configuredPassword || !configuredSecret);

const password = configuredPassword || DEV_PASSWORD;
const secret = new TextEncoder().encode(configuredSecret || DEV_SECRET);

/** True when no ADMIN_PASSWORD is configured (insecure dev default in use). */
export function adminUsesDefaultPassword(): boolean {
  return !configuredPassword;
}

/** True when admin auth is disabled because prod env vars are unset. */
export function adminAuthDisabled(): boolean {
  return authDisabled;
}

/** Constant-time, length-independent comparison of two secrets. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  if (authDisabled) return false;
  return safeEqual(input, password);
}

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (authDisabled) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
