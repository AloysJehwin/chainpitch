import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

// Type definitions for better type safety
interface CoinStoreData {
  coin?: {
    value: string;
  };
  value?: string;
  [key: string]: any;
}

interface AccountResource {
  type: string;
  data: CoinStoreData;
}

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
      (r: any): r is AccountResource => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    
    if (accountResource) {
      console.log('Account resource found:', accountResource.type);
      
      // Safe property access with fallbacks
      let balance = '0';
      const data = accountResource.data as CoinStoreData;
      
      // Try different possible structures
      if (data && typeof data === 'object') {
        if (data.coin && typeof data.coin === 'object' && data.coin.value) {
          balance = data.coin.value;
          console.log('Found balance in data.coin.value:', balance);
        } else if (data.value) {
          balance = data.value;
          console.log('Found balance in data.value:', balance);
        } else {
          // Search for any property that looks like a balance
          const keys = Object.keys(data);
          for (const key of keys) {
            const value = data[key];
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              balance = value;
              console.log(`Found balance in data.${key}:`, balance);
              break;
            }
            if (typeof value === 'object' && value && 'value' in value) {
              const nestedValue = (value as any).value;
              if (typeof nestedValue === 'string' && /^\d+$/.test(nestedValue)) {
                balance = nestedValue;
                console.log(`Found balance in data.${key}.value:`, balance);
                break;
              }
            }
          }
        }
      }
      
      const balanceNumber = parseInt(balance || '0') / 100000000; // Convert from Octas to APT
      
      return NextResponse.json({
        balance: balanceNumber,
        raw_balance: balance,
        debug_info: {
          resource_type: accountResource.type,
          data_keys: data ? Object.keys(data) : [],
          data_structure: JSON.stringify(data, null, 2)
        }
      });
    } else {
      // Account might not be initialized yet
      console.log('No coin store found for address:', address);
      console.log('Available resource types:', resources.map((r: any) => r.type));
      
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