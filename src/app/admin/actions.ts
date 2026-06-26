"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
} from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
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
