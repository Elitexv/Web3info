import Link from "next/link";
import { LayoutDashboard, Newspaper, Users, LogOut, ExternalLink } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/seo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export function AdminSidebar({ userName }: { userName: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
      <div className="mb-8 px-2">
        <span className="font-display gradient-text text-lg font-bold">
          {SITE_NAME}
        </span>
        <p className="text-xs text-muted-foreground">Newsroom</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent"
        >
          <ExternalLink className="size-4" />
          View site
        </Link>
        <p className="truncate px-3 text-xs text-muted-foreground">
          {userName}
        </p>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
