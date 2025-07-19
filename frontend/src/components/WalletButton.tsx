"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const WalletButton: React.FC = () => {
  const { 
    account, 
    chainId, 
    isConnected, 
    isConnecting, 
    error, 
    balance,
    connectWallet, 
    disconnectWallet,
    switchNetwork 
  } = useWallet();
  
  const [copied, setCopied] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get network name
  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      11155111: 'Sepolia',
    };
    return networks[chainId] || 'Unknown Network';
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (account && chainId) {
      const explorers: { [key: number]: string } = {
        1: 'https://etherscan.io',
        137: 'https://polygonscan.com',
        11155111: 'https://sepolia.etherscan.io',
      };
      const explorerUrl = explorers[chainId];
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${account}`, '_blank');
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full"
          size="lg"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px]">
          <Wallet className="mr-2 h-4 w-4" />
          <span className="mr-2">{formatAddress(account!)}</span>
          <span className="text-xs text-muted-foreground">
            ({getNetworkName(chainId!)})
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel>Account Details</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Address</p>
          <p className="text-sm font-mono">{formatAddress(account!)}</p>
        </div>
        
        {balance && (
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-medium">
              {parseFloat(balance).toFixed(4)} {chainId === 137 ? 'MATIC' : 'ETH'}
            </p>
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={viewOnExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => switchNetwork(1)}>
          Switch to Ethereum
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => switchNetwork(137)}>
          Switch to Polygon
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => switchNetwork(11155111)}>
          Switch to Sepolia
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};