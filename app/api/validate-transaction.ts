// pages/api/validate-transaction.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationRequest, ValidationResponse } from '../types/aptos';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      valid: false, 
      message: 'Method not allowed' 
    });
  }

  const { transaction, signature }: ValidationRequest = req.body;

  if (!transaction) {
    return res.status(400).json({ 
      valid: false, 
      message: 'Transaction is required' 
    });
  }

  try {
    // Basic validation
    if (!transaction.data || !transaction.data.function) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid transaction format' 
      });
    }

    // Validate function format
    const functionName = transaction.data.function;
    if (!functionName.includes('::')) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid function format' 
      });
    }

    // Validate recipient address format (for transfer transactions)
    if (functionName === '0x1::coin::transfer') {
      const functionArgs = transaction.data.functionArguments;
      if (!functionArgs || functionArgs.length < 2) {
        return res.status(400).json({ 
          valid: false, 
          message: 'Transfer function requires recipient and amount' 
        });
      }

      const recipient = functionArgs[0];
      if (!recipient.startsWith('0x')) {
        return res.status(400).json({ 
          valid: false, 
          message: 'Invalid recipient address format' 
        });
      }

      // Validate amount
      const amount = functionArgs[1];
      if (isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
        return res.status(400).json({ 
          valid: false, 
          message: 'Invalid amount' 
        });
      }
    }

    // Validate type arguments
    if (!transaction.data.typeArguments || transaction.data.typeArguments.length === 0) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Type arguments are required' 
      });
    }

    res.status(200).json({ 
      valid: true, 
      message: 'Transaction is valid' 
    });
  } catch (error: any) {
    console.error('Error validating transaction:', error);
    
    res.status(500).json({ 
      valid: false, 
      message: 'Error validating transaction',
      error: error.message || 'Unknown error occurred'
    });
  }
}