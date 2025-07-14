import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ message: 'Address is required' }, { status: 400 });
  }

  try {
    const resources = await aptos.getAccountResources({
      accountAddress: address,
    });
    
    console.log('Resources found:', resources.length);
    
    const accountResource = resources.find(
      (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    
    if (accountResource) {
      console.log('Account resource:', JSON.stringify(accountResource, null, 2));
      
      // Handle different possible data structures
      let balance = '0';
      
      if (accountResource.data?.coin?.value) {
        balance = accountResource.data.coin.value;
      } else if (accountResource.data?.value) {
        balance = accountResource.data.value;
      } else if (typeof accountResource.data === 'string') {
        balance = accountResource.data;
      } else {
        console.log('Unexpected resource structure:', accountResource.data);
        // Try to find balance in any nested structure
        const findBalance = (obj: any): string => {
          if (typeof obj === 'string' && /^\d+$/.test(obj)) return obj;
          if (typeof obj === 'number') return obj.toString();
          if (obj && typeof obj === 'object') {
            for (const key in obj) {
              if (key === 'value' && typeof obj[key] === 'string') return obj[key];
              if (key === 'balance' && typeof obj[key] === 'string') return obj[key];
              const result = findBalance(obj[key]);
              if (result !== '0') return result;
            }
          }
          return '0';
        };
        balance = findBalance(accountResource.data);
      }
      
      const balanceNumber = parseInt(balance) / 100000000; // Convert from Octas to APT
      
      return NextResponse.json({
        balance: balanceNumber,
        raw_balance: balance,
        debug_info: {
          resource_type: accountResource.type,
          data_structure: typeof accountResource.data,
          has_coin: !!accountResource.data?.coin,
          has_value: !!accountResource.data?.value
        }
      });
    } else {
      // Account might not be initialized yet
      console.log('No coin store found for address:', address);
      return NextResponse.json({
        balance: 0,
        raw_balance: '0',
        debug_info: {
          message: 'Account not found or not initialized',
          total_resources: resources.length,
          resource_types: resources.map((r: any) => r.type)
        }
      });
    }
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ 
      message: 'Error fetching balance',
      error: error.message,
      balance: 0,
      raw_balance: '0'
    }, { status: 500 });
  }
}