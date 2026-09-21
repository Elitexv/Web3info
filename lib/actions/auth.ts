"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function authenticate(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
