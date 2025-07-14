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

    console.log('Faucet request for address:', address);

    // Return updated manual instructions with working alternatives
    return NextResponse.json({
      success: false,
      message: 'Please use one of these working testnet faucets:',
      manual_instructions: {
        message: 'Multiple faucet options available',
        faucets: [
          {
            name: 'Aptos CLI Faucet',
            method: 'command_line',
            instructions: [
              '1. Install Aptos CLI: curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3',
              '2. Run: aptos account fund-with-faucet --account YOUR_ADDRESS'
            ]
          },
          {
            name: 'Aptos TypeScript SDK',
            method: 'direct_api',
            url: 'https://fullnode.testnet.aptoslabs.com',
            instructions: [
              '1. Use direct API calls to the Aptos faucet endpoint',
              '2. POST to: https://faucet.testnet.aptoslabs.com/mint',
              '3. With body: {"address": "YOUR_ADDRESS", "amount": 100000000}'
            ]
          },
          {
            name: 'Alternative Faucets',
            method: 'third_party',
            options: [
              'https://www.alchemy.com/faucets/aptos-testnet',
              'https://faucet.triangleplatform.com/aptos/testnet',
              'Discord: Aptos Community #testnet-faucet channel'
            ]
          }
        ],
        your_address: address,
        note: 'If all faucets fail, try asking in the Aptos Discord community.'
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Faucet error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Faucet service error',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}