import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME } from "@/lib/seo";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const userName = session.user.name ?? "Admin";

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <header className="flex items-center justify-between border-b border-border p-3 md:hidden">
        <span className="font-display gradient-text text-lg font-bold">
          {SITE_NAME}
        </span>
        <AdminMobileNav userName={userName} signOutAction={signOutAction} />
      </header>
      <AdminSidebar userName={userName} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
      <Toaster />
    </div>
  );
}
