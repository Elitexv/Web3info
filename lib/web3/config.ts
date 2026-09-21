import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mainnet, base, arbitrum, optimism, polygon } from "wagmi/chains";

const appName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Webinfo";
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    "[web3] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect (QR/mobile) connections won't work until you add a real project id from https://cloud.reown.com. MetaMask/browser-extension wallets still work."
  );
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet],
    },
  ],
  { appName, projectId }
);

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon],
  connectors,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
});
