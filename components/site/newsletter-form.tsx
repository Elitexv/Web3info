"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/public";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, {});

  return (
    <div className={cn("w-full max-w-md", className)}>
      <form action={formAction} className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@wallet.eth"
          className="bg-background"
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? "Joining…" : "Subscribe"}
        </Button>
      </form>
      {state?.message && (
        <p className="mt-2 text-sm text-accent">{state.message}</p>
      )}
      {state?.error && (
        <p className="mt-2 text-sm text-bearish">{state.error}</p>
      )}
    </div>
  );
}
