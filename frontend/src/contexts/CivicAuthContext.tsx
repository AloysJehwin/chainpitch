// src/contexts/CivicAuthContext.tsx - Simplified for your existing setup

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@/contexts/WalletContext';

// Types
interface CivicAuthContextType {
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  requestVerification: () => void;
  refreshStatus: () => void;
}

// Create context
const CivicAuthContext = createContext<CivicAuthContextType | null>(null);

// Simple Civic provider that works with your existing wallet
export const CivicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate Civic verification check
  // In production, this would check against Civic's actual API
  const checkVerificationStatus = async () => {
    if (!address) {
      setIsVerified(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll simulate the verification
      // In production, you would:
      // 1. Check if user has completed Civic verification
      // 2. Validate their Civic pass on-chain
      // 3. Store verification status
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, let's say some wallets are "verified"
      // In production, this would be real Civic verification
      const mockVerifiedWallets = new Set([
        // Add some mock verified wallet addresses for testing
      ]);
      
      // Check localStorage for verification status (temporary solution)
      const verificationKey = `civic_verified_${address}`;
      const storedVerification = localStorage.getItem(verificationKey);
      
      if (storedVerification === 'true') {
        setIsVerified(true);
      } else if (mockVerifiedWallets.has(address)) {
        setIsVerified(true);
        localStorage.setItem(verificationKey, 'true');
      } else {
        setIsVerified(false);
      }
      
    } catch (err: any) {
      console.error('Civic verification check failed:', err);
      setError(err.message || 'Verification check failed');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Request verification (simulated)
  const requestVerification = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Open Civic verification flow
      // 2. Guide user through identity verification
      // 3. Return verification result
      
      // For demo, we'll simulate the process
      const userConfirmed = window.confirm(
        'This will open the Civic verification process.\n\n' +
        'In production, you would be redirected to Civic to verify your identity.\n\n' +
        'For demo purposes, click OK to simulate successful verification.'
      );
      
      if (userConfirmed) {
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark as verified
        const verificationKey = `civic_verified_${address}`;
        localStorage.setItem(verificationKey, 'true');
        setIsVerified(true);
        
        alert('🎉 Verification successful! You can now participate in DAO activities.');
      }
      
    } catch (err: any) {
      console.error('Civic verification request failed:', err);
      setError(err.message || 'Verification request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh status
  const refreshStatus = () => {
    checkVerificationStatus();
  };

  // Check status when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      checkVerificationStatus();
    } else {
      setIsVerified(false);
    }
  }, [isConnected, address]);

  const contextValue: CivicAuthContextType = {
    isVerified,
    isLoading,
    error,
    requestVerification,
    refreshStatus,
  };

  return (
    <CivicAuthContext.Provider value={contextValue}>
      {children}
    </CivicAuthContext.Provider>
  );
};

// Hook to use Civic auth
export const useCivicAuth = () => {
  const context = useContext(CivicAuthContext);
  if (!context) {
    throw new Error('useCivicAuth must be used within CivicProvider');
  }
  return context;
};

// Verification button component
export const CivicVerificationButton: React.FC<{ className?: string }> = ({ 
  className = "" 
}) => {
  const { isVerified, isLoading, requestVerification, error } = useCivicAuth();
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-muted-foreground mb-2">
          Connect your wallet to verify with Civic
        </p>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className={`flex items-center text-green-600 ${className}`}>
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Verified with Civic
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={requestVerification}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        {isLoading ? 'Verifying...' : 'Verify with Civic'}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Complete identity verification to participate in ChainPitch DAO
      </p>
    </div>
  );
};

// Higher-order component for protected routes
export const withCivicAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function ProtectedComponent(props: P) {
    const { isVerified, isLoading } = useCivicAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Checking verification status...</span>
        </div>
      );
    }

    if (!isVerified) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to complete Civic verification to access this feature.
            </p>
            <CivicVerificationButton />
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};