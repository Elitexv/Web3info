import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CryptoTicker } from "@/components/site/crypto-ticker";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ConnectWalletButton } from "@/components/site/connect-wallet-button";
import { MobileNav } from "@/components/site/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/seo";

export async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <CryptoTicker />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <MobileNav categories={categories} />
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="font-display gradient-text truncate text-lg font-bold tracking-tight sm:text-xl">
              {SITE_NAME}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Search className="size-4" />
          </Link>
          <ThemeToggle />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
