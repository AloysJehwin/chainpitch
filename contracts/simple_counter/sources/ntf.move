// contracts/simple_nft/sources/nft.move
module nft_addr::simple_nft {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    /// NFT Collection resource
    struct NFTCollection has key {
        name: String,
        description: String,
        total_supply: u64,
        max_supply: u64,
    }

    /// NFT Token resource
    struct NFTToken has key {
        name: String,
        description: String,
        image_uri: String,
        created_at: u64,
    }

    /// Events
    struct CollectionCreatedEvent has drop, store {
        creator: address,
        collection_name: String,
        max_supply: u64,
    }

    struct TokenMintedEvent has drop, store {
        minter: address,
        token_name: String,
        token_id: u64,
    }

    /// Error codes
    const E_COLLECTION_EXISTS: u64 = 1;
    const E_COLLECTION_NOT_EXISTS: u64 = 2;
    const E_MAX_SUPPLY_REACHED: u64 = 3;
    const E_INVALID_SUPPLY: u64 = 4;

    /// Create a new NFT collection
    public entry fun create_collection(
        creator: &signer,
        name: String,
        description: String,
        max_supply: u64,
        image_uri: String,
    ) {
        let creator_addr = signer::address_of(creator);
        assert!(!exists<NFTCollection>(creator_addr), E_COLLECTION_EXISTS);
        assert!(max_supply > 0, E_INVALID_SUPPLY);

        // Create collection using token objects framework
        collection::create_unlimited_collection(
            creator,
            description,
            name,
            option::none(),
            image_uri,
        );

        // Store collection metadata
        let nft_collection = NFTCollection {
            name,
            description,
            total_supply: 0,
            max_supply,
        };
        move_to(creator, nft_collection);

        // Emit event
        event::emit(CollectionCreatedEvent {
            creator: creator_addr,
            collection_name: name,
            max_supply,
        });
    }

    /// Mint a new NFT token
    public entry fun mint_token(
        minter: &signer,
        collection_creator: address,
        token_name: String,
        token_description: String,
        image_uri: String,
    ) acquires NFTCollection {
        assert!(exists<NFTCollection>(collection_creator), E_COLLECTION_NOT_EXISTS);
        
        let collection = borrow_global_mut<NFTCollection>(collection_creator);
        assert!(collection.total_supply < collection.max_supply, E_MAX_SUPPLY_REACHED);

        // Create the token
        let token_constructor_ref = token::create_named_token(
            minter,
            collection.name,
            token_description,
            token_name,
            option::none(),
            image_uri,
        );

        // Update supply
        collection.total_supply = collection.total_supply + 1;

        // Emit event
        event::emit(TokenMintedEvent {
            minter: signer::address_of(minter),
            token_name,
            token_id: collection.total_supply,
        });
    }

    /// Get collection info (view function)
    #[view]
    public fun get_collection_info(creator: address): (String, String, u64, u64) acquires NFTCollection {
        assert!(exists<NFTCollection>(creator), E_COLLECTION_NOT_EXISTS);
        let collection = borrow_global<NFTCollection>(creator);
        (collection.name, collection.description, collection.total_supply, collection.max_supply)
    }

    /// Check if collection exists
    #[view]
    public fun collection_exists(creator: address): bool {
        exists<NFTCollection>(creator)
    }

    /// Get total supply
    #[view]
    public fun get_total_supply(creator: address): u64 acquires NFTCollection {
        if (!exists<NFTCollection>(creator)) {
            return 0
        };
        borrow_global<NFTCollection>(creator).total_supply
    }

    /// Get max supply
    #[view]
    public fun get_max_supply(creator: address): u64 acquires NFTCollection {
        if (!exists<NFTCollection>(creator)) {
            return 0
        };
        borrow_global<NFTCollection>(creator).max_supply
    }
}