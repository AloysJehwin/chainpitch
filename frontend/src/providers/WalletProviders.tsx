// src/providers/WalletProvider.tsx

"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { CivicProvider } from '@/contexts/CivicAuthContext';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface AppWalletProviderProps {
  children: React.ReactNode;
}

export const AppWalletProvider: React.FC<AppWalletProviderProps> = ({ children }) => {
  // Configure network (mainnet-beta, testnet, or devnet)
  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet for testing
  
  // RPC endpoint
  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Mainnet) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
    }
    return clusterApiUrl(network);
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CivicProvider>
            {children}
          </CivicProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};