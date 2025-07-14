// types/aptos.ts

export interface WalletAccount {
  address: string;
  publicKey: string;
}

export interface TransactionResponse {
  hash: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  gas_used: string;
  success: boolean;
  version: string;
  changes: any[];
  events: any[];
  timestamp: string;
}

export interface BalanceResponse {
  balance: number;
  raw_balance: string;
}

export interface FaucetRequest {
  address: string;
  amount?: number;
}

export interface FaucetResponse {
  success: boolean;
  message: string;
  txn_hash?: string;
  error?: string;
}

export interface TransactionRequest {
  data: {
    function: string;
    functionArguments: string[];
    typeArguments: string[];
  };
}

export interface ValidationRequest {
  transaction: TransactionRequest;
  signature: string | null;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  error?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions: TransactionResponse[];
  message?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}