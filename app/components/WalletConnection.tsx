'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

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
  const [transactions, setTransactions] = useState<any[]>([]);

  // Helper functions
  const getAddressString = useCallback((address: any): string => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object' && address.address) return address.address;
    if (address && typeof address.toString === 'function') return address.toString();
    return '';
  }, []);

  const formatAddress = useCallback((address: string | any): string => {
    if (typeof address === 'string') {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    if (address && typeof address === 'object' && address.address) {
      const addr = address.address;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    
    if (address && typeof address.toString === 'function') {
      const addr = address.toString();
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    
    return 'Invalid Address';
  }, []);

  // Fetch functions
  const fetchBalance = useCallback(async (): Promise<void> => {
    if (!account?.address) return;
    
    try {
      const addressStr = getAddressString(account.address);
      if (!addressStr) {
        console.log('Invalid address format');
        return;
      }
      
      console.log('Fetching balance for address:', addressStr);
      
      // Test API connectivity first
      try {
        const testResponse = await fetch('/api/test');
        const testData = await testResponse.json();
        console.log('API test successful:', testData);
      } catch (testError) {
        console.error('API test failed:', testError);
        setError('API server not responding');
        return;
      }
      
      // Now try to fetch balance
      const response = await fetch(`/api/balance-working?address=${addressStr}`);
      console.log('Balance API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Balance API HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Balance API response:', data);
      
      const balanceValue = data.balance ?? 0;
      setBalance(balanceValue);
      setError('');
      
      console.log('Balance set to:', balanceValue, 'APT');
      
    } catch (error: any) {
      console.error('Balance fetch error:', error);
      setError(`Failed to fetch balance: ${error.message}`);
      setBalance(0);
    }
  }, [account?.address, getAddressString]);

  const fetchTransactions = useCallback(async (): Promise<void> => {
    if (!account?.address) return;
    
    try {
      const addressStr = getAddressString(account.address);
      if (!addressStr) return;
        
      const response = await fetch(`/api/account/transactions?address=${addressStr}&limit=5`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTransactions(data.transactions);
      } else {
        console.error('Error fetching transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [account?.address, getAddressString]);

  // Fetch balance and transactions when account changes
  useEffect(() => {
    if (account) {
      fetchBalance();
      fetchTransactions();
    }
  }, [account, fetchBalance, fetchTransactions]);

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
    if (!account?.address) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const addressStr = getAddressString(account.address);
      if (!addressStr) {
        setError('Invalid address format');
        return;
      }

      // Try direct faucet first
      const response = await fetch('/api/faucet-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: addressStr,
          amount: 100000000 // 1 APT
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTxnHash(data.txn_hash || '');
        setError('');
        
        // Refresh balance after funding
        setTimeout(() => {
          fetchBalance();
          fetchTransactions();
        }, 3000);
      } else {
        // Show alternative faucet options
        if (data.alternatives) {
          setError(
            <div>
              <p><strong>{data.message}</strong></p>
              <div style={{ marginTop: '15px' }}>
                <p><strong>Working Alternatives:</strong></p>
                {data.alternatives.map((alt: any, index: number) => (
                  <div key={index} style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: '#f0f8ff', 
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{alt.name}</div>
                    {alt.url && (
                      <div style={{ marginTop: '5px' }}>
                        <a 
                          href={alt.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'underline' }}
                        >
                          🔗 {alt.url}
                        </a>
                      </div>
                    )}
                    {alt.command && (
                      <div style={{ 
                        marginTop: '5px', 
                        fontFamily: 'monospace', 
                        background: '#f5f5f5', 
                        padding: '5px',
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }}>
                        {alt.command}
                      </div>
                    )}
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                      {alt.description}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: '#fff3cd', 
                borderRadius: '5px',
                border: '1px solid #ffeaa7'
              }}>
                <strong>Your Address:</strong>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.9em', 
                  background: '#f8f9fa', 
                  padding: '5px',
                  marginTop: '5px',
                  borderRadius: '3px',
                  wordBreak: 'break-all'
                }}>
                  {addressStr}
                </div>
              </div>
            </div>
          );
        } else {
          setError(`Faucet failed: ${data.message}`);
        }
      }
    } catch (error: any) {
      setError(
        <div>
          <p><strong>Faucet service unavailable.</strong></p>
          <p>Please try these working alternatives:</p>
          <div style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>🔗 Alchemy Faucet:</strong>
              <br />
              <a 
                href="https://www.alchemy.com/faucets/aptos-testnet" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2', textDecoration: 'underline' }}
              >
                https://www.alchemy.com/faucets/aptos-testnet
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>💬 Discord:</strong>
              <br />
              <a 
                href="https://discord.gg/aptoslabs" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2', textDecoration: 'underline' }}
              >
                Ask in #testnet-faucet channel
              </a>
            </div>
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}>
              <strong>Your Address:</strong> {getAddressString(account?.address)}
            </div>
          </div>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (): Promise<void> => {
    if (!account?.address) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const addressStr = getAddressString(account.address);
      if (!addressStr) {
        setError('Invalid address format');
        return;
      }

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
        sender: addressStr,
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
        <p><strong>Address:</strong> {account?.address ? formatAddress(account.address) : 'Loading...'}</p>
        <p><strong>Full Address:</strong> <span className="full-address">
          {getAddressString(account?.address) || 'Loading...'}
        </span></p>
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
            {isLoading ? 'Processing...' : '🚰 Get Testnet Tokens'}
          </button>

          <button 
            onClick={fetchBalance}
            disabled={isLoading}
            className="action-btn refresh-btn"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white'
            }}
          >
            🔄 Refresh Balance
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