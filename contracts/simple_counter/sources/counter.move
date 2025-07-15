module counter_addr::counter {
    use std::signer;
    use aptos_framework::event;

    /// Counter resource stored in user's account
    struct Counter has key {
        value: u64,
    }

    /// Event emitted when counter is incremented
    struct CounterIncrementEvent has drop, store {
        old_value: u64,
        new_value: u64,
    }

    /// Error codes
    const E_COUNTER_NOT_EXISTS: u64 = 1;

    /// Initialize counter for the signer
    public entry fun initialize(account: &signer) {
        let counter = Counter { value: 0 };
        move_to(account, counter);
    }

    /// Increment counter by 1
    public entry fun increment(account: &signer) acquires Counter {
        let account_addr = signer::address_of(account);
        assert!(exists<Counter>(account_addr), E_COUNTER_NOT_EXISTS);
        
        let counter = borrow_global_mut<Counter>(account_addr);
        let old_value = counter.value;
        counter.value = counter.value + 1;
        
        // Emit event
        event::emit(CounterIncrementEvent {
            old_value,
            new_value: counter.value,
        });
    }

    /// Set counter to specific value
    public entry fun set_count(account: &signer, value: u64) acquires Counter {
        let account_addr = signer::address_of(account);
        assert!(exists<Counter>(account_addr), E_COUNTER_NOT_EXISTS);
        
        let counter = borrow_global_mut<Counter>(account_addr);
        counter.value = value;
    }

    /// Get current counter value (view function)
    #[view]
    public fun get_count(account_addr: address): u64 acquires Counter {
        if (!exists<Counter>(account_addr)) {
            return 0
        };
        borrow_global<Counter>(account_addr).value
    }

    /// Check if counter exists for account
    #[view]
    public fun counter_exists(account_addr: address): bool {
        exists<Counter>(account_addr)
    }
}