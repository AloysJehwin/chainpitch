import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transaction, signature } = await request.json();

    if (!transaction) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Transaction is required' 
      }, { status: 400 });
    }

    // Basic validation
    if (!transaction.data || !transaction.data.function) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid transaction format' 
      }, { status: 400 });
    }

    // Validate function format
    const functionName = transaction.data.function;
    if (!functionName.includes('::')) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid function format' 
      }, { status: 400 });
    }

    // Validate recipient address format (for transfer transactions)
    if (functionName === '0x1::coin::transfer') {
      const functionArgs = transaction.data.functionArguments;
      if (!functionArgs || functionArgs.length < 2) {
        return NextResponse.json({ 
          valid: false, 
          message: 'Transfer function requires recipient and amount' 
        }, { status: 400 });
      }

      const recipient = functionArgs[0];
      if (!recipient.startsWith('0x')) {
        return NextResponse.json({ 
          valid: false, 
          message: 'Invalid recipient address format' 
        }, { status: 400 });
      }

      // Validate amount
      const amount = functionArgs[1];
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return NextResponse.json({ 
          valid: false, 
          message: 'Invalid amount' 
        }, { status: 400 });
      }
    }

    // Validate type arguments
    if (!transaction.data.typeArguments || transaction.data.typeArguments.length === 0) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Type arguments are required' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true, 
      message: 'Transaction is valid' 
    });
  } catch (error: any) {
    console.error('Error validating transaction:', error);
    
    return NextResponse.json({ 
      valid: false, 
      message: 'Error validating transaction',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}