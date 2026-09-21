import { LoginForm } from "@/components/admin/login-form";
import { SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="font-display gradient-text text-2xl font-bold">
          {SITE_NAME}
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Sign in to the newsroom
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
