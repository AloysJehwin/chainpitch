// pages/api/balance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { BalanceResponse } from '../types/aptos';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BalanceResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ message: 'Address is required' });
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
      const response: BalanceResponse = {
        balance: parseInt(balance) / 100000000, // Convert from Octas to APT
        raw_balance: balance
      };
      res.status(200).json(response);
    } else {
      const response: BalanceResponse = {
        balance: 0,
        raw_balance: '0'
      };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Error fetching balance' });
  }
}