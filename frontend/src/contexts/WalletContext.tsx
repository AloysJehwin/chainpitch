"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Supported networks configuration
const SUPPORTED_NETWORKS = {
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  11155111: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18
    },
    rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    const { ethereum } = window as any;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // Get user's balance
  const getBalance = async (address: string) => {
    try {
      const { ethereum } = window as any;
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const { ethereum } = window as any;
      
      // Request accounts
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Get chain ID
      const chainId = await ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      setAccount(accounts[0]);
      setChainId(parseInt(chainId, 16));
      setIsConnected(true);
      
      // Get balance
      await getBalance(accounts[0]);
      
      // Store connection state
      localStorage.setItem('walletConnected', 'true');
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance(null);
    setError(null);
    localStorage.removeItem('walletConnected');
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    try {
      const { ethereum } = window as any;
      const chainIdHex = `0x${targetChainId.toString(16)}`;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const networkConfig = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS];
          if (networkConfig) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            });
          }
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    // Reload the page to reset the app state
    window.location.reload();
  };

  // Initialize wallet connection on mount
  useEffect(() => {
    const init = async () => {
      if (isMetaMaskInstalled() && localStorage.getItem('walletConnected') === 'true') {
        try {
          const { ethereum } = window as any;
          const accounts = await ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            const chainId = await ethereum.request({ 
              method: 'eth_chainId' 
            });
            
            setAccount(accounts[0]);
            setChainId(parseInt(chainId, 16));
            setIsConnected(true);
            await getBalance(accounts[0]);
          }
        } catch (error) {
          console.error('Error initializing wallet:', error);
        }
      }
    };

    init();

    // Set up event listeners
    if (isMetaMaskInstalled()) {
      const { ethereum } = window as any;
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value: WalletContextType = {
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};