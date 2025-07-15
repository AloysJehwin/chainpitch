'use client';

import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { SmartContract, ContractFunction } from '../types/contracts';

// Sample contracts for demonstration
const SAMPLE_CONTRACTS: SmartContract[] = [
  {
    name: 'Coin Transfer',
    address: '0x1',
    description: 'Standard APT coin operations',
    functions: [
      {
        name: 'Get Balance',
        function: 'coin::balance',
        typeArguments: ['0x1::aptos_coin::AptosCoin'],
        arguments: [
          { name: 'account', type: 'address', description: 'Account address', placeholder: '0x...' }
        ],
        description: 'Get APT balance of an account',
        category: 'read'
      },
      {
        name: 'Transfer Coins',
        function: 'coin::transfer',
        typeArguments: ['0x1::aptos_coin::AptosCoin'],
        arguments: [
          { name: 'to', type: 'address', description: 'Recipient address', placeholder: '0x...' },
          { name: 'amount', type: 'u64', description: 'Amount in Octas', placeholder: '100000000' }
        ],
        description: 'Transfer APT to another account',
        category: 'write'
      }
    ]
  },
  {
    name: 'Simple Counter',
    address: '0x1',
    description: 'A simple counter smart contract example',
    functions: [
      {
        name: 'Initialize Counter',
        function: 'counter::initialize',
        arguments: [],
        description: 'Initialize counter in your account',
        category: 'write'
      },
      {
        name: 'Get Counter',
        function: 'counter::get_count',
        arguments: [
          { name: 'counter_address', type: 'address', description: 'Counter owner address', placeholder: '0x...' }
        ],
        description: 'Get current counter value',
        category: 'read'
      },
      {
        name: 'Increment Counter',
        function: 'counter::increment',
        arguments: [],
        description: 'Increment your counter by 1',
        category: 'write'
      },
      {
        name: 'Set Counter',
        function: 'counter::set_count',
        arguments: [
          { name: 'value', type: 'u64', description: 'New counter value', placeholder: '42' }
        ],
        description: 'Set counter to specific value',
        category: 'write'
      }
    ]
  },
  {
    name: 'Simple NFT',
    address: '0x1',
    description: 'Basic NFT collection and minting',
    functions: [
      {
        name: 'Create Collection',
        function: 'simple_nft::create_collection',
        arguments: [
          { name: 'name', type: 'string', description: 'Collection name', placeholder: 'My NFT Collection' },
          { name: 'description', type: 'string', description: 'Collection description', placeholder: 'A cool NFT collection' },
          { name: 'max_supply', type: 'u64', description: 'Maximum NFTs', placeholder: '1000' },
          { name: 'image_uri', type: 'string', description: 'Collection image URL', placeholder: 'https://...' }
        ],
        description: 'Create a new NFT collection',
        category: 'write'
      },
      {
        name: 'Mint NFT',
        function: 'simple_nft::mint_token',
        arguments: [
          { name: 'collection_creator', type: 'address', description: 'Collection creator address', placeholder: '0x...' },
          { name: 'token_name', type: 'string', description: 'NFT name', placeholder: 'My NFT #1' },
          { name: 'token_description', type: 'string', description: 'NFT description', placeholder: 'A unique NFT' },
          { name: 'image_uri', type: 'string', description: 'NFT image URL', placeholder: 'https://...' }
        ],
        description: 'Mint a new NFT token',
        category: 'write'
      },
      {
        name: 'Get Collection Info',
        function: 'simple_nft::get_collection_info',
        arguments: [
          { name: 'creator', type: 'address', description: 'Collection creator', placeholder: '0x...' }
        ],
        description: 'Get collection details',
        category: 'read'
      },
      {
        name: 'Check Collection Exists',
        function: 'simple_nft::collection_exists',
        arguments: [
          { name: 'creator', type: 'address', description: 'Collection creator', placeholder: '0x...' }
        ],
        description: 'Check if collection exists',
        category: 'read'
      }
    ]
  }
];

const SmartContractInterface: React.FC = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  const [functionArgs, setFunctionArgs] = useState<{ [key: string]: string }>({});
  const [customContractAddress, setCustomContractAddress] = useState('');
  const [customFunction, setCustomFunction] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get address string
  const getAddressString = (address: any): string => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object' && address.address) return address.address;
    if (address && typeof address.toString === 'function') return address.toString();
    return '';
  };

  const handleArgumentChange = (argName: string, value: string) => {
    setFunctionArgs(prev => ({
      ...prev,
      [argName]: value
    }));
  };

  const executeFunction = async () => {
    if (!selectedFunction && !customFunction) {
      setError('Please select a function or enter a custom function');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const contractAddress = customContractAddress || getAddressString(account?.address) || '0x1';
      const functionName = customFunction || selectedFunction?.function || '';
      
      // Prepare arguments
      const args = selectedFunction?.arguments.map(arg => {
        const value = functionArgs[arg.name] || '';
        
        // Convert types as needed
        switch (arg.type) {
          case 'u64':
          case 'u128':
            return parseInt(value) || 0;
          case 'bool':
            return value.toLowerCase() === 'true';
          case 'address':
            return value.startsWith('0x') ? value : `0x${value}`;
          default:
            return value;
        }
      }) || Object.values(functionArgs);

      const typeArgs = selectedFunction?.typeArguments || [];

      if (selectedFunction?.category === 'read') {
        // View function call
        const response = await fetch('/api/contracts/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contract_address: contractAddress,
            function_name: functionName,
            type_arguments: typeArgs,
            arguments: args,
            is_view: true
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setResult({
            type: 'view_result',
            data: data.result,
            message: 'View function executed successfully'
          });
        } else {
          throw new Error(data.error);
        }
      } else {
        // Write function - requires wallet transaction
        if (!connected || !account) {
          throw new Error('Please connect your wallet for write operations');
        }

        const payload = {
          function: `${contractAddress}::${functionName}`,
          typeArguments: typeArgs,
          functionArguments: args,
        };

        console.log('Executing transaction with payload:', payload);

        const txnResponse = await signAndSubmitTransaction({
          sender: account.address,
          data: payload,
        });

        setResult({
          type: 'transaction_result',
          hash: txnResponse.hash,
          message: 'Transaction submitted successfully'
        });
      }
    } catch (error: any) {
      console.error('Function execution error:', error);
      setError(error.message || 'Function execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="contract-interface">
        <h3>Smart Contract Interface</h3>
        <p>Please connect your wallet to interact with smart contracts.</p>
      </div>
    );
  }

  return (
    <div className="contract-interface">
      <h3>🔧 Smart Contract Interface</h3>
      
      {/* Contract Selection */}
      <div className="contract-selection">
        <h4>Select Contract</h4>
        <div className="contract-grid">
          {SAMPLE_CONTRACTS.map((contract, index) => (
            <div 
              key={index}
              className={`contract-card ${selectedContract === contract ? 'selected' : ''}`}
              onClick={() => {
                setSelectedContract(contract);
                setSelectedFunction(null);
                setFunctionArgs({});
                setResult(null);
                setError('');
              }}
            >
              <div className="contract-name">{contract.name}</div>
              <div className="contract-address">{contract.address}</div>
              <div className="contract-description">{contract.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Contract Input */}
      <div className="custom-contract">
        <h4>Or Use Custom Contract</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder={`Contract Address (default: ${account?.address || '0x...'})`}
            value={customContractAddress}
            onChange={(e) => setCustomContractAddress(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Function (module::function_name)"
            value={customFunction}
            onChange={(e) => setCustomFunction(e.target.value)}
            className="input-field"
          />
        </div>
        {account?.address && (
          <div className="address-helper">
            <strong>💡 Your Wallet Address:</strong>
            <div className="address-display">
              {account.address}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(account.address.toString());
                  alert('Address copied to clipboard!');
                }}
                className="copy-btn"
              >
                📋 Copy
              </button>
            </div>
            <small>Use this address when deploying contracts with: <code>counter_addr={account.address}</code></small>
          </div>
        )}
      </div>

      {/* Function Selection */}
      {selectedContract && (
        <div className="function-selection">
          <h4>Select Function</h4>
          <div className="function-grid">
            {selectedContract.functions.map((func, index) => (
              <div 
                key={index}
                className={`function-card ${selectedFunction === func ? 'selected' : ''} ${func.category}`}
                onClick={() => {
                  setSelectedFunction(func);
                  setFunctionArgs({});
                  setResult(null);
                  setError('');
                }}
              >
                <div className="function-name">{func.name}</div>
                <div className="function-category">{func.category}</div>
                <div className="function-description">{func.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Function Arguments */}
      {(selectedFunction || customFunction) && (
        <div className="function-arguments">
          <h4>Function Arguments</h4>
          {selectedFunction?.arguments?.map((arg, index) => (
            <div key={index} className="argument-input">
              <label>{arg.name} ({arg.type})</label>
              <input
                type="text"
                placeholder={arg.placeholder || arg.description}
                value={functionArgs[arg.name] || ''}
                onChange={(e) => handleArgumentChange(arg.name, e.target.value)}
                className="input-field"
              />
              <small>{arg.description}</small>
            </div>
          )) || (
            <div className="argument-input">
              <label>Arguments (JSON array)</label>
              <input
                type="text"
                placeholder='["arg1", "arg2"]'
                onChange={(e) => {
                  try {
                    const args = JSON.parse(e.target.value || '[]');
                    setFunctionArgs(args);
                  } catch (err) {
                    console.log('Invalid JSON');
                  }
                }}
                className="input-field"
              />
            </div>
          )}
          
          <button 
            onClick={executeFunction}
            disabled={isLoading}
            className="execute-btn"
          >
            {isLoading ? 'Executing...' : 'Execute Function'}
          </button>
        </div>
      )}

      {/* Results */}
      {error && (
        <div className="error-result">
          <h4>❌ Error</h4>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div className="success-result">
          <h4>✅ Result</h4>
          <p>{result.message}</p>
          {result.type === 'view_result' && (
            <div className="result-data">
              <strong>Returned Data:</strong>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          )}
          {result.type === 'transaction_result' && (
            <div className="transaction-info">
              <strong>Transaction Hash:</strong> {result.hash}
              <br />
              <a 
                href={`https://explorer.aptoslabs.com/txn/${result.hash}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartContractInterface;