// src/contexts/WalletContext.tsx - Enhanced with Civic support

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for your existing wallet context
interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Add any other existing methods you have
}

// Create the context
const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Your existing wallet connection logic
  const connect = async () => {
    setIsLoading(true);
    try {
      // Add your existing wallet connection logic here
      // For example, if you're using a specific wallet library:
      
      if (typeof window !== 'undefined' && (window as any).solana) {
        const response = await (window as any).solana.connect();
        setAddress(response.publicKey.toString());
        setIsConnected(true);
      } else {
        // Fallback or alternative wallet connection
        console.log('Wallet not found');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    // Add your existing disconnection logic
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).solana) {
        try {
          const response = await (window as any).solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setAddress(response.publicKey.toString());
            setIsConnected(true);
          }
        } catch (error) {
          // User not connected or rejected
        }
      }
    };

    checkConnection();
  }, []);

  const contextValue: WalletContextType = {
    isConnected,
    address,
    isLoading,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};