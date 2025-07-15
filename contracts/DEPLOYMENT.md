# Smart Contract Deployment Guide

## Prerequisites

1. **Install Aptos CLI**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. **Initialize Aptos CLI**
```bash
aptos init --network testnet
```

## Deploy the Counter Contract

1. **Navigate to contract directory**
```bash
cd contracts/simple_counter
```

2. **Compile the contract**
```bash
aptos move compile
```

3. **Deploy to testnet**
```bash
aptos move publish --named-addresses counter_addr=YOUR_ADDRESS
```

4. **Verify deployment**
```bash
aptos account list --query modules
```

## Using the Contract in the App

After deployment, update the smart contract interface with your deployed address:

1. Replace `YOUR_ADDRESS` in the contract address field
2. Use these function calls:
   - `YOUR_ADDRESS::counter::initialize` - Initialize counter
   - `YOUR_ADDRESS::counter::increment` - Increment by 1
   - `YOUR_ADDRESS::counter::set_count` - Set to specific value
   - `YOUR_ADDRESS::counter::get_count` - View current value

## Example Contract Addresses (Testnet)

- Standard Coin Operations: `0x1`
- Your Deployed Counter: `YOUR_DEPLOYED_ADDRESS`

## Common Move Contract Patterns

### 1. Resource Management
```move
struct MyResource has key {
    value: u64,
}

public entry fun initialize(account: &signer) {
    move_to(account, MyResource { value: 0 });
}
```

### 2. View Functions
```move
#[view]
public fun get_value(addr: address): u64 acquires MyResource {
    borrow_global<MyResource>(addr).value
}
```

### 3. Entry Functions
```move
public entry fun update_value(account: &signer, new_value: u64) acquires MyResource {
    let resource = borrow_global_mut<MyResource>(signer::address_of(account));
    resource.value = new_value;
}
```

## Testing Your Contract

1. **Initialize your counter**
   - Function: `initialize`
   - Args: none

2. **Increment the counter**
   - Function: `increment` 
   - Args: none

3. **Check the value**
   - Function: `get_count`
   - Args: [your_address]

4. **Set custom value**
   - Function: `set_count`
   - Args: [42]