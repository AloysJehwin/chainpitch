import { TempoInit } from "@/components/tempo-init";
import { WalletProvider } from "@/contexts/WalletContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChainPitch - Decentralized Startup Funding Platform",
  description: "Connect innovative startups with investors through DAO-driven funding on the blockchain",
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
          {children}
        </WalletProvider>
        <TempoInit />
      </body>
    </html>
  );
}