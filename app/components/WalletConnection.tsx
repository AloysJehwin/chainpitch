// app/components/WalletConnection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

interface TransactionPayload {
  function: string;
  functionArguments: (string | number)[];
  typeArguments: string[];
}

const WalletConnection: React.FC = () => {
  const { 
    account, 
    connected, 
    disconnect, 
    signAndSubmitTransaction,
    wallets,
    connect
  } = useWallet();

  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('0x1');
  const [amount, setAmount] = useState<string>('0.01');

  // Fetch balance when account changes
  useEffect(() => {
    if (account) {
      fetchBalance();
    }
  }, [account]);

  const fetchBalance = async (): Promise<void> => {
    if (!account) return;
    
    try {
      const response = await fetch(`/api/balance?address=${account.address}`);
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.balance);
        setError('');
      } else {
        setError('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Network error while fetching balance');
    }
  };

  const handleConnect = async (walletName: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await connect(walletName);
    } catch (error: any) {
      setError(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaucet = async (): Promise<void> => {
    if (!account) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: account.address,
          amount: 100000000 // 1 APT
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTxnHash(data.txn_hash || '');
        setError('');
        
        // Refresh balance and transactions after funding
        setTimeout(() => {
          fetchBalance();
          fetchTransactions();
        }, 3000);
      } else {
        setError(`Faucet request failed: ${data.message}`);
      }
    } catch (error: any) {
      setError(`Faucet request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (): Promise<void> => {
    if (!account) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const transaction: TransactionPayload = {
        function: '0x1::coin::transfer',
        functionArguments: [
          recipientAddress,
          Math.floor(parseFloat(amount) * 100000000), // Convert APT to Octas
        ],
        typeArguments: ['0x1::aptos_coin::AptosCoin'],
      };

      // Validate transaction before submitting
      const validationResponse = await fetch('/api/validate-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transaction: { data: transaction }, 
          signature: null 
        }),
      });

      const validationData = await validationResponse.json();
      
      if (!validationData.valid) {
        setError(`Transaction validation failed: ${validationData.message}`);
        return;
      }

      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: transaction,
      });
      
      setTxnHash(response.hash);
      setError('');
      
      // Refresh balance and transactions after transaction
      setTimeout(() => {
        fetchBalance();
        fetchTransactions();
      }, 3000);
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setError(`Transaction failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <div className="wallet-container">
        <h2>Connect Your Aptos Wallet</h2>
        <p>Choose a wallet to connect:</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="wallet-options">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={isLoading}
              className="connect-btn"
              style={{ marginBottom: '10px', display: 'block', width: '100%' }}
            >
              {isLoading ? 'Connecting...' : `Connect ${wallet.name}`}
            </button>
          ))}
          
          {wallets.length === 0 && (
            <div className="no-wallets">
              <p>No wallets detected. Please install a supported wallet:</p>
              <ul>
                <li><a href="https://petra.app/" target="_blank" rel="noopener noreferrer">Petra Wallet</a></li>
                <li><a href="https://martianwallet.xyz/" target="_blank" rel="noopener noreferrer">Martian Wallet</a></li>
                <li><a href="https://pontem.network/" target="_blank" rel="noopener noreferrer">Pontem Wallet</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-info">
        <h2>Wallet Connected ✅</h2>
        <p><strong>Address:</strong> {formatAddress(account!.address)}</p>
        <p><strong>Full Address:</strong> <span className="full-address">{account!.address}</span></p>
        <p><strong>Balance:</strong> {balance.toFixed(4)} APT</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="transaction-form">
          <h3>Send Transaction</h3>
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address:</label>
            <input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount (APT):</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              step="0.01"
              min="0.01"
              className="input-field"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="actions">
          <button 
            onClick={handleFaucet}
            disabled={isLoading}
            className="action-btn faucet-btn"
          >
            {isLoading ? 'Processing...' : 'Request Testnet Tokens'}
          </button>
          
          <button 
            onClick={handleTransfer}
            disabled={isLoading || balance < parseFloat(amount) || !recipientAddress.startsWith('0x')}
            className="action-btn transfer-btn"
          >
            {isLoading ? 'Processing...' : `Send ${amount} APT`}
          </button>
          
          <button 
            onClick={disconnect}
            className="action-btn disconnect-btn"
            disabled={isLoading}
          >
            Disconnect
          </button>
        </div>

        {txnHash && (
          <div className="transaction-result">
            <h3>Transaction Successful! ✅</h3>
            <p><strong>Hash:</strong> {formatAddress(txnHash)}</p>
            <p><strong>Full Hash:</strong> <span className="full-address">{txnHash}</span></p>
            <a 
              href={`https://explorer.aptoslabs.com/txn/${txnHash}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Aptos Explorer →
            </a>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="transaction-history">
            <h3>Recent Transactions</h3>
            <div className="transactions-list">
              {transactions.map((tx: any, index: number) => (
                <div key={index} className="transaction-item">
                  <div className="tx-info">
                    <span className="tx-type">
                      {tx.type ? tx.type.split('::').pop() || 'Transaction' : 'Transaction'}
                    </span>
                    <span className="tx-version">Version: {tx.version}</span>
                    <span className={`tx-status ${tx.success ? 'success' : 'failed'}`}>
                      {tx.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="tx-hash">
                    <a 
                      href={`https://explorer.aptoslabs.com/txn/${tx.hash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatAddress(tx.hash)}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;