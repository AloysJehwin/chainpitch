// app/api/balance/route.ts
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
    
    const accountResource = resources.find(
      (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    
    if (accountResource) {
      const balance = accountResource.data.coin.value;
      return NextResponse.json({
        balance: parseInt(balance) / 100000000, // Convert from Octas to APT
        raw_balance: balance
      });
    } else {
      return NextResponse.json({
        balance: 0,
        raw_balance: '0'
      });
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ message: 'Error fetching balance' }, { status: 500 });
  }
}