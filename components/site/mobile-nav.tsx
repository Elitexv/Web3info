"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/seo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display gradient-text text-xl">
            {SITE_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Home
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
