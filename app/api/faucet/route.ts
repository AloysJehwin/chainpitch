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

    // The official faucet now requires authentication, so we'll provide manual instructions
    console.log('Faucet request received for address:', address);
    
    // Return manual instructions since automatic faucet requires auth
    return NextResponse.json({
      success: false,
      message: 'Automatic faucet is currently unavailable due to authentication requirements.',
      manual_instructions: {
        message: 'Please use the manual faucet to get testnet tokens',
        steps: [
          '1. Go to https://aptoslabs.com/testnet-faucet',
          '2. Paste your address in the input field',
          '3. Click "Fund Account" button',
          '4. Wait for the transaction to complete',
          '5. Refresh this page to see your balance'
        ],
        address: address,
        faucet_url: 'https://aptoslabs.com/testnet-faucet'
      }
    }, { status: 200 }); // Return 200 instead of 400 since this is expected behavior

  } catch (error: any) {
    console.error('Faucet error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Faucet service error',
      manual_instructions: {
        message: 'Please use the manual faucet to get testnet tokens',
        steps: [
          '1. Go to https://aptoslabs.com/testnet-faucet',
          '2. Paste your address in the input field',
          '3. Click "Fund Account" button'
        ],
        faucet_url: 'https://aptoslabs.com/testnet-faucet'
      },
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}