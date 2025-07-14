// app/api/faucet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function POST(request: NextRequest) {
  try {
    const { address, amount = 100000000 } = await request.json();

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Address is required' 
      }, { status: 400 });
    }

    const result = await aptos.fundAccount({
      accountAddress: address,
      amount: amount,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Faucet request successful',
      txn_hash: result.hash
    });
  } catch (error: any) {
    console.error('Faucet error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Faucet request failed',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}