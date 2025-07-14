// pages/api/faucet.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { FaucetRequest, FaucetResponse } from '../types/aptos';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FaucetResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { address, amount = 100000000 }: FaucetRequest = req.body;

  if (!address) {
    return res.status(400).json({ 
      success: false, 
      message: 'Address is required' 
    });
  }

  try {
    const result = await aptos.fundAccount({
      accountAddress: address,
      amount: amount,
    });
    
    const response: FaucetResponse = {
      success: true,
      message: 'Faucet request successful',
      txn_hash: result.hash
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Faucet error:', error);
    
    const response: FaucetResponse = {
      success: false,
      message: 'Faucet request failed',
      error: error.message || 'Unknown error occurred'
    };
    
    res.status(500).json(response);
  }
}