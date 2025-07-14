// app/api/transaction/[hash]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const { hash } = params;

  if (!hash) {
    return NextResponse.json({ 
      success: false, 
      message: 'Transaction hash is required' 
    }, { status: 400 });
  }

  try {
    const transaction = await aptos.getTransactionByHash({
      transactionHash: hash,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: transaction
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching transaction',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}