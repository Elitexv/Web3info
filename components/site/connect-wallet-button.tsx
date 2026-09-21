"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <Button variant="outline" size="sm" disabled className="gap-2 px-2 sm:px-3">
              <Wallet className="size-4" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 px-2 sm:px-3"
              onClick={openConnectModal}
            >
              <Wallet className="size-4" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            className="max-w-28 gap-2 px-2 font-mono sm:max-w-none sm:px-3"
            onClick={openAccountModal}
          >
            <span className="size-2 shrink-0 rounded-full bg-bullish" />
            <span className="truncate">{account.displayName}</span>
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
