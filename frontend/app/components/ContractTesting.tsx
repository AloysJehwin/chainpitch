'use client';

import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const ContractTesting: React.FC = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Helper function to safely render any value
  const safeRender = (value: any) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return JSON.stringify(value);
  };

  const runContractTests = async () => {
    if (!connected || !account) {
      alert('Please connect your wallet first');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Test 1: Initialize Counter',
        description: 'Initialize a counter in your account',
        action: async () => {
          const payload = {
            function: `${account.address}::counter::initialize`,
            typeArguments: [],
            functionArguments: [],
          };
          
          const txn = await signAndSubmitTransaction({
            sender: account.address,
            data: payload,
          });
          
          return { hash: txn.hash, success: true };
        }
      },
      {
        name: 'Test 2: Check Counter Value',
        description: 'Read the current counter value',
        action: async () => {
          const response = await fetch('/api/contracts/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contract_address: account.address,
              function_name: 'counter::get_count',
              arguments: [account.address],
              is_view: true
            })
          });
          
          const data = await response.json();
          return { result: data.result, success: data.success };
        }
      },
      {
        name: 'Test 3: Increment Counter',
        description: 'Increment the counter by 1',
        action: async () => {
          const payload = {
            function: `${account.address}::counter::increment`,
            typeArguments: [],
            functionArguments: [],
          };
          
          const txn = await signAndSubmitTransaction({
            sender: account.address,
            data: payload,
          });
          
          return { hash: txn.hash, success: true };
        }
      },
      {
        name: 'Test 4: Set Counter to 42',
        description: 'Set counter to a specific value',
        action: async () => {
          const payload = {
            function: `${account.address}::counter::set_count`,
            typeArguments: [],
            functionArguments: [42],
          };
          
          const txn = await signAndSubmitTransaction({
            sender: account.address,
            data: payload,
          });
          
          return { hash: txn.hash, success: true };
        }
      },
      {
        name: 'Test 5: Final Counter Check',
        description: 'Verify the counter value is 42',
        action: async () => {
          const response = await fetch('/api/contracts/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contract_address: account.address,
              function_name: 'counter::get_count',
              arguments: [account.address],
              is_view: true
            })
          });
          
          const data = await response.json();
          const success = data.success && data.result && data.result[0] === 42;
          return { result: data.result, success, expected: 42 };
        }
      }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      try {
        setTestResults(prev => [...prev, {
          ...test,
          status: 'running',
          result: null,
          error: null
        }]);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
        
        const result = await test.action();
        
        setTestResults(prev => prev.map((item, index) => 
          index === i ? {
            ...item,
            status: result.success ? 'passed' : 'failed',
            result: result,
            error: null
          } : item
        ));
        
      } catch (error: any) {
        setTestResults(prev => prev.map((item, index) => 
          index === i ? {
            ...item,
            status: 'failed',
            result: null,
            error: error.message
          } : item
        ));
      }
    }
    
    setIsRunning(false);
  };

  if (!connected) {
    return (
      <div className="contract-testing">
        <h3>🧪 Contract Testing Suite</h3>
        <p>Please connect your wallet to run contract tests.</p>
      </div>
    );
  }

  return (
    <div className="contract-testing">
      <h3>🧪 Contract Testing Suite</h3>
      <p>Run automated tests on your deployed smart contracts.</p>
      
      <div className="test-controls">
        <button 
          onClick={runContractTests}
          disabled={isRunning}
          className="run-tests-btn"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={() => setTestResults([])}
          disabled={isRunning}
          className="clear-tests-btn"
        >
          Clear Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="test-results">
          <h4>Test Results</h4>
          {testResults.map((test, index) => (
            <div key={index} className={`test-item ${test.status}`}>
              <div className="test-header">
                <span className="test-name">{test.name}</span>
                <span className={`test-status ${test.status}`}>
                  {test.status === 'running' && '⏳'}
                  {test.status === 'passed' && '✅'}
                  {test.status === 'failed' && '❌'}
                  {test.status}
                </span>
              </div>
              
              <div className="test-description">{test.description}</div>
              
              {test.result && (
                <div className="test-result">
                  {test.result.hash && (
                    <div>
                      <strong>Transaction:</strong> 
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${test.result.hash}?network=testnet`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {test.result.hash.slice(0, 16)}...
                      </a>
                    </div>
                  )}
                  {test.result.result && (
                    <div>
                      <strong>Result:</strong> {safeRender(test.result.result)}
                    </div>
                  )}
                  {test.result.expected !== undefined && (
                    <div>
                      <strong>Expected:</strong> {safeRender(test.result.expected)}
                    </div>
                  )}
                </div>
              )}
              
              {test.error && (
                <div className="test-error">
                  <strong>Error:</strong> {test.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="test-info">
        <h4>📋 Testing Instructions</h4>
        <ol>
          <li>Deploy the counter contract to your account first</li>
          <li>Make sure you have testnet APT for gas fees</li>
          <li>Click "Run All Tests" to execute the test suite</li>
          <li>Each test will run sequentially with results displayed</li>
          <li>Green ✅ means passed, Red ❌ means failed</li>
        </ol>
        
        <div className="deployment-reminder">
          <strong>💡 Contract Deployment:</strong>
          <pre>
cd contracts/simple_counter
aptos move publish --named-addresses counter_addr={account?.address || 'YOUR_ADDRESS'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ContractTesting;