"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Share on X
      </a>
      <Button variant="outline" size="sm" className="gap-2" onClick={copyLink}>
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
