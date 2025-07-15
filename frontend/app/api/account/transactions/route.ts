import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const limit = searchParams.get('limit') || '10';

  if (!address) {
    return NextResponse.json({ 
      success: false, 
      transactions: [],
      message: 'Address is required' 
    }, { status: 400 });
  }

  try {
    const transactions = await aptos.getAccountTransactions({
      accountAddress: address,
      options: {
        limit: parseInt(limit)
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      transactions: transactions
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json({ 
      success: false, 
      transactions: [],
      message: 'Error fetching transactions',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}