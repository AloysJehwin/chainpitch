import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address, amount = 100000000 } = await request.json();

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Address is required' 
      }, { status: 400 });
    }

    console.log('Direct faucet request for:', address);

    // Try different faucet endpoints
    const faucetEndpoints = [
      {
        url: 'https://faucet.testnet.aptoslabs.com/mint',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { address, amount }
      },
      {
        url: 'https://fullnode.testnet.aptoslabs.com/v1/mint',
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: { address, amount }
      }
    ];

    for (const endpoint of faucetEndpoints) {
      try {
        console.log('Trying faucet endpoint:', endpoint.url);
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers,
          body: JSON.stringify(endpoint.body)
        });

        console.log('Faucet response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('Faucet success:', result);
          
          return NextResponse.json({
            success: true,
            message: 'Faucet request successful!',
            txn_hash: result.hash || result.txn_hash || 'success',
            endpoint: endpoint.url
          });
        } else {
          const errorText = await response.text();
          console.log(`Faucet ${endpoint.url} failed:`, response.status, errorText);
        }
      } catch (endpointError: any) {
        console.log(`Faucet ${endpoint.url} error:`, endpointError.message);
      }
    }

    // If all automatic methods fail, return working alternatives
    return NextResponse.json({
      success: false,
      message: 'Automatic faucets are currently unavailable. Please use these alternatives:',
      alternatives: [
        {
          name: 'Alchemy Aptos Faucet',
          url: 'https://www.alchemy.com/faucets/aptos-testnet',
          description: 'Reliable third-party faucet'
        },
        {
          name: 'Triangle Platform Faucet',
          url: 'https://faucet.triangleplatform.com/aptos/testnet',
          description: 'Community faucet'
        },
        {
          name: 'Aptos CLI',
          command: `aptos account fund-with-faucet --account ${address}`,
          description: 'Use the official Aptos CLI tool'
        },
        {
          name: 'Aptos Discord',
          url: 'https://discord.gg/aptoslabs',
          description: 'Ask for testnet tokens in #testnet-faucet channel'
        }
      ],
      your_address: address
    }, { status: 200 });

  } catch (error: any) {
    console.error('Direct faucet error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Faucet request failed',
      error: error.message,
      alternatives: [
        'Try https://www.alchemy.com/faucets/aptos-testnet',
        'Use Aptos CLI: aptos account fund-with-faucet --account YOUR_ADDRESS',
        'Ask in Aptos Discord #testnet-faucet channel'
      ]
    }, { status: 500 });
  }
}