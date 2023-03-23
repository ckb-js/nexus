# Nexus With Rule-based Ownership

The `secp256k1_blake160` lock script is the most commonly used lock script in the CKB. It is also the lock that Nexus is
using. A cell locked by a `secp256k1_blake160` lock can only be unlocked by the owner of the key.

For a platform with smart contract capabilities, assets ownership is often controlled by contracts. For such assets, we
cannot directly use `secp256k1_blake160` to lock the cell corresponding to the asset, because in doing so, the ownership
of the asset cannot be controlled by the contract.

So for assets controlled by contracts, the contract will require the user to prove his identity, and then the contract
will decide whether to allow the user to operate the asset. The [
cheque](https://github.com/duanyytop/ckb-cheque-script/blob/89c0ef98e161882a374e2c091147808f30ca5c5b/contracts/ckb-cheque-script/src/entry.rs#L47-L53)
lock is an example, its unlocking(claiming) rule is:

```ts
// when claiming a cheque
if (inputs.contains(receiver_lock_hash)) return true;
```

## Working With Existing Contracts

// TODO: explain how to work with a dotbit account lock

## Working With Batching

// TODO: explain how to handle batching
// 1. sign off-chain message(for single aggregator system)
// 2. use a messaging cell(for multiple aggregator system)

## Warning

### Anyone Can Pay

// TODO: explain why anyone can pay is dangerous
