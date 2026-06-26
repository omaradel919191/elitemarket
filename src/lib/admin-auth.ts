import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

const password = process.env.ADMIN_PASSWORD || DEV_PASSWORD;
const secret = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET || DEV_SECRET,
);

/** True when no ADMIN_PASSWORD is configured (insecure dev default in use). */
export function adminUsesDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: string): boolean {
  return input === password;
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
