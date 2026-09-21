import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";
import { NewsletterForm } from "@/components/site/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <span className="font-display gradient-text text-lg font-bold">
              {SITE_NAME}
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              Breaking Web3, crypto, and blockchain news — delivered before it
              trends.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Stay ahead of the chain</p>
            <p className="mb-3 text-sm text-muted-foreground">
              One email a day. No noise.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/feed.xml" className="hover:text-foreground">
              RSS
            </Link>
            <Link href="/admin/login" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
