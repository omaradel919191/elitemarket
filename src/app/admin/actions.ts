"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
} from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  // Throttle brute-force: 8 attempts per IP per 10 minutes.
  const ip = clientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, 8, 10 * 60_000).ok) {
    redirect("/admin/login?error=throttled");
  }

  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) {
    redirect("/admin/login?error=1");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
