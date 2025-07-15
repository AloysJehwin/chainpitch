import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export async function POST(request: NextRequest) {
  try {
    const { 
      contract_address, 
      function_name, 
      type_arguments = [], 
      arguments: functionArgs = [],
      is_view = false 
    } = await request.json();

    if (!contract_address || !function_name) {
      return NextResponse.json({
        success: false,
        error: 'Contract address and function name are required'
      }, { status: 400 });
    }

    console.log('Contract call:', {
      contract_address,
      function_name,
      type_arguments,
      arguments: functionArgs,
      is_view
    });

    if (is_view) {
      // For view functions (read-only)
      try {
        const result = await aptos.view({
          payload: {
            function: `${contract_address}::${function_name}`,
            typeArguments: type_arguments,
            functionArguments: functionArgs,
          }
        });

        return NextResponse.json({
          success: true,
          result: result,
          type: 'view_call'
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: `View call failed: ${error.message}`,
          details: error
        }, { status: 400 });
      }
    } else {
      // For transaction payload preparation (write functions)
      try {
        const payload = {
          function: `${contract_address}::${function_name}`,
          typeArguments: type_arguments,
          functionArguments: functionArgs,
        };

        // Validate the payload
        return NextResponse.json({
          success: true,
          payload: payload,
          type: 'transaction_payload',
          message: 'Transaction payload prepared. Use this with wallet signing.'
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: `Payload preparation failed: ${error.message}`
        }, { status: 400 });
      }
    }
  } catch (error: any) {
    console.error('Contract call error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}