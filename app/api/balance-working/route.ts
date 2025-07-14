import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  console.log('Balance API called with address:', address);

  if (!address) {
    console.log('No address provided');
    return NextResponse.json({ 
      message: 'Address is required',
      balance: 0,
      raw_balance: '0'
    }, { status: 400 });
  }

  try {
    console.log('Fetching balance for:', address);
    
    // Use Aptos REST API directly
    const url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/resources`;
    console.log('Calling URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Aptos API response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Account not found - returning 0 balance');
        return NextResponse.json({
          balance: 0,
          raw_balance: '0',
          message: 'Account not initialized yet'
        });
      }
      
      const errorText = await response.text();
      console.log('Aptos API error:', errorText);
      throw new Error(`Aptos API error: ${response.status} - ${errorText}`);
    }

    const resources = await response.json();
    console.log('Resources received:', resources.length);

    // Find APT coin store
    const aptCoinStore = resources.find((resource: any) => 
      resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );

    if (aptCoinStore) {
      console.log('APT coin store found');
      console.log('Coin store data:', JSON.stringify(aptCoinStore.data, null, 2));
      
      let balanceValue = '0';
      
      // Try to extract balance safely
      try {
        if (aptCoinStore.data && aptCoinStore.data.coin && aptCoinStore.data.coin.value) {
          balanceValue = aptCoinStore.data.coin.value;
        } else if (aptCoinStore.data && aptCoinStore.data.value) {
          balanceValue = aptCoinStore.data.value;
        }
      } catch (e) {
        console.log('Error extracting balance:', e);
      }

      const balanceInAPT = parseInt(balanceValue) / 100000000;
      
      console.log('Balance found:', balanceValue, 'octas =', balanceInAPT, 'APT');
      
      return NextResponse.json({
        balance: balanceInAPT,
        raw_balance: balanceValue,
        success: true
      });
    } else {
      console.log('No APT coin store found');
      return NextResponse.json({
        balance: 0,
        raw_balance: '0',
        message: 'No APT coin store found'
      });
    }

  } catch (error: any) {
    console.error('Balance API error:', error);
    return NextResponse.json({
      balance: 0,
      raw_balance: '0',
      error: error.message,
      message: 'Failed to fetch balance'
    }, { status: 500 });
  }
}