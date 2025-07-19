// src/app/layout.tsx - Updated to include Civic

import { TempoInit } from "@/components/tempo-init";
import { WalletProvider } from "@/contexts/WalletContext";
import { CivicProvider } from "@/contexts/CivicAuthContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChainPitch - Decentralized Startup Funding Platform",
  description: "Connect innovative startups with investors through DAO-driven funding on the blockchain with verified identities",
  keywords: ["blockchain", "DAO", "startup", "funding", "Civic", "verification", "Solana"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <WalletProvider>
          <CivicProvider clientId="724c8ef3-0a37-4eb8-bbc5-37872660062e" theme="dark">
            {children}
          </CivicProvider>
        </WalletProvider>
        <TempoInit />
      </body>
    </html>
  );
}