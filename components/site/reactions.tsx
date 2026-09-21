"use client";

import { useState, useTransition } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "@/lib/actions/public";
import { cn } from "@/lib/utils";
import { Rocket, TrendingDown, TrendingUp } from "lucide-react";

type ReactionType = "LIKE" | "BULLISH" | "BEARISH";

const OPTIONS: { type: ReactionType; label: string; icon: typeof Rocket }[] = [
  { type: "LIKE", label: "Love it", icon: Rocket },
  { type: "BULLISH", label: "Bullish", icon: TrendingUp },
  { type: "BEARISH", label: "Bearish", icon: TrendingDown },
];

export function Reactions({
  articleId,
  counts,
  initialReactedTypes,
}: {
  articleId: string;
  counts: Record<ReactionType, number>;
  initialReactedTypes: ReactionType[];
}) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [localCounts, setLocalCounts] = useState(counts);
  const [reacted, setReacted] = useState(new Set(initialReactedTypes));
  const [isPending, startTransition] = useTransition();

  function handleClick(type: ReactionType) {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    const alreadyReacted = reacted.has(type);
    setLocalCounts((prev) => ({
      ...prev,
      [type]: prev[type] + (alreadyReacted ? -1 : 1),
    }));
    setReacted((prev) => {
      const next = new Set(prev);
      if (alreadyReacted) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });

    startTransition(() => {
      toggleReaction(articleId, address, type);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant={reacted.has(type) ? "default" : "outline"}
          size="sm"
          disabled={isPending}
          className={cn("gap-2")}
          onClick={() => handleClick(type)}
        >
          <Icon className="size-4" />
          {label}
          <span className="tabular-nums opacity-70">
            {localCounts[type] ?? 0}
          </span>
        </Button>
      ))}
    </div>
  );
}
