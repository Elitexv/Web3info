import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { themeInitScript } from "@/lib/theme-script";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Web3 & Crypto News`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Web3 & Crypto News`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Web3 & Crypto News`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#08080f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <Web3Provider>{children}</Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
