import type { Metadata } from 'next';
import './globals.css';
import WalletProvider from './providers/WalletProvider';

export const metadata: Metadata = {
  title: 'Aptos Wallet Integration Demo',
  description: 'Next.js app with Aptos wallet integration using App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}