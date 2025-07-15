// app/types/contracts.ts

export interface ContractFunction {
  name: string;
  function: string;
  typeArguments?: string[];
  arguments: ContractArgument[];
  description: string;
  category: 'read' | 'write';
}

export interface ContractArgument {
  name: string;
  type: 'address' | 'u64' | 'u128' | 'string' | 'bool' | 'vector';
  description: string;
  placeholder?: string;
}

export interface SmartContract {
  name: string;
  address: string;
  description: string;
  functions: ContractFunction[];
  abi?: any;
}

export interface ContractCallResult {
  success: boolean;
  result?: any;
  transaction_hash?: string;
  error?: string;
  gas_used?: string;
}

export interface DeployedContract {
  name: string;
  address: string;
  deployer: string;
  deployment_hash: string;
  timestamp: string;
  verified: boolean;
}