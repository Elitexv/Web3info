"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCoinMarkets } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export function CryptoTicker() {
  const { data, isError } = useQuery({
    queryKey: ["coin-markets"],
    queryFn: fetchCoinMarkets,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });

  if (isError || !data || data.length === 0) return null;

  const items = [...data, ...data];

  return (
    <div className="w-full overflow-hidden border-b border-border bg-card/60">
      <div className="flex w-max animate-ticker gap-8 py-2">
        {items.map((coin, i) => {
          const up = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={`${coin.id}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap px-2 text-sm"
            >
              <span className="font-semibold uppercase text-foreground">
                {coin.symbol}
              </span>
              <span className="text-muted-foreground">
                $
                {coin.current_price.toLocaleString(undefined, {
                  maximumFractionDigits: coin.current_price < 1 ? 4 : 2,
                })}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5 font-medium",
                  up ? "text-bullish" : "text-bearish"
                )}
              >
                {up ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
