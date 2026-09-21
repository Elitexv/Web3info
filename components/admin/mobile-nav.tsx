"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  LayoutDashboard,
  Newspaper,
  Users,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/seo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export function AdminMobileNav({
  userName,
  signOutAction,
}: {
  userName: string;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col">
        <SheetHeader>
          <SheetTitle className="font-display gradient-text text-xl">
            {SITE_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border px-4 py-4">
          <Link
            href="/"
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
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
              onClick={() => setOpen(false)}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
