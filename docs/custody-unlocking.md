# Nexus Working with Custody Unlocking

## Custody Unlocking

The `secp256k1_blake160` lock script is the most commonly used lock script in the CKB. It is also a lock that Nexus is
using. A cell locked by a `secp256k1_blake160` lock can only be unlocked by the owner of the key.

For a platform with smart contract capabilities, assets ownership is often controlled by contracts. For such assets, we
cannot directly use `secp256k1_blake160` to lock the cell corresponding to the asset, because in doing so, the ownership
of the asset cannot be controlled by the contract.

So for assets controlled by contracts, the contract will require the user to prove his identity, and then the contract
will decide whether to allow the user to operate the asset. The [
cheque](https://github.com/duanyytop/ckb-cheque-script/blob/89c0ef98e161882a374e2c091147808f30ca5c5b/contracts/ckb-cheque-script/src/entry.rs#L47-L53)
lock is an example, its unlocking(claiming) rule is:

```ts
declare const receiver_lock_script_hash: Hash;
declare const tx: Transaction;

declare function to_script_hash(script: Script): Hash;

const inputs_lock_hashes = tx.inputs.map(to_script_hash);
if (inputs_lock_hashes.contains(receiver_lock_script_hash)) {
  return true;
}
```

The advantage of this unlocking method is that it is extremely flexible, and almost any unlocking rule can be
implemented, whether it is a simple signature verification or a complex multi-signature verification. The cheque lock
does not care about the way the signature is made, it is a way to decouple the program.

## Working With Existing Contracts

However, not all systems have implemented custody unlocking, but adding custody unlocking rules may not be difficult. In
general, the contracts will have a design similar to `flag`/`version` for extensibility.

Here is an example of the .bit's account cell. The DAS signature verification is performed in the type script,
but this does not affect our discussion.

> .bit used to be called DAS, so the following DAS refers to the same thing as .bit

> structure of a .bit account cell
>
> ```
> # https://github.com/dotbitHQ/das-contracts/blob/15ae8f4376e31bf57dc99cb09472de3732d5cb5f/docs/zh-hans/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/Cell-%E7%BB%93%E6%9E%84%E5%8D%8F%E8%AE%AE.md#%E7%BB%93%E6%9E%84-3
> lock:
>   code_hash: <das-lock>
>   type: type
>   args: [
>     owner_algorithm_id,
>     owner_pubkey_hash,
>     manager_algorithm_id,
>     manager_pubkey_hash,
>   ]
> type: <account-cell-type>
>
> data:
>   hash(witness: AccountCellData) // 32 bytes
>   id // 20 bytes，自己的 ID，生成算法为 hash(account)，然后取前 20 Bytes
>   next // 20 bytes，下一个 AccountCell 的 ID
>   expired_at // 8 bytes，小端编码的 u64 时间戳
>   account // expired_at 之后的所有 bytes，utf-8 编码，AccountCell 为了避免数据丢失导致用户无法找回自己用户所以额外储存了 account 的明文信息, 包含 .bit 后缀
>
> ```

.bit
supports [multiple chains](https://github.com/dotbitHQ/das-contracts/blob/15ae8f4376e31bf57dc99cb09472de3732d5cb5f/libs/das-dynamic-libs/src/constants.rs#L7-L15)
signature algorithm, so the .bit's _das-lock_ args contains a flag `algorithm_id` to indicate which signature algorithm
is used by the current account cell, which provides the possibility of upgrading. In short, the .bit account type script
can add an `algorithm_id` to indicate that the current lock is using custody-unlocking, and then implement the
custody-unlocking.

This is an example of the .bit account cell that uses custody-unlocking
to [edit_record](https://github.com/dotbitHQ/das-contracts/blob/15ae8f4376e31bf57dc99cb09472de3732d5cb5f/contracts/account-cell-type/src/entry.rs#L115)

```yaml
inputs:
  das-account-cell:
    lock:
      code_hash: <das-lock>
      type: type
      args:
        0x06 # custody-unlocking
        lock_hash # the hash of the lock script that will be used to unlock the cell
        manager_algorithm_id
        manager_pubkey_hash
    type: <account-cell-type>
    data: <account-cell-data>
  any-nexus-cell:
    lock:
      code_hash: <secp256k1_blake160>
      type: type
      args: pubkey_hash
outputs:
  ...
```

The upgrade not only brings the possibility of supporting Nexus, but also simplifies the system design, because the
implementation of these signature algorithms can all depend on the Omnilock provided capabilities, Omnilock is also a
lock that
supports [multiple signature algorithms](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0042-omnilock/0042-omnilock.md#authentication),
and the functionality is more powerful

```yaml
inputs:
  das-account-cell:
    lock:
      code_hash: <das-lock>
      type: type
      args:
        0x06 # custody-unlocking
        lock_hash # the hash of the lock script that will be used to unlock the cell
        manager_algorithm_id
        manager_pubkey_hash
    type: <account-cell-type>
    data: <account-cell-data>
  omnilock-cell:
    lock:
      code_hash: <omnilock>
      type: type
      args:
        0x01 # Ethereum EIP-191 personal_sign
        eth_address
outputs:
  ...
```

Unfortunately, Omnilock currently does not support EIP-712 signatures.

## Working With Concurrency

We often state that the UTxO system is inherently parallel, but it requires additional design for concurrent scenarios.
How do we understand that UTxO can be parallel but not straightforward to be concurrent? Let's imagine that there is a
certain NFT issuance limit. To prevent the issuance of NFTs from exceeding the limit, when minting a new NFT, we need to
check if the number of NFTs already issued exceeds the limit. At this point, we need to rely on a shared state, which is
the number of NFTs currently issued. In other words, we need to serialize these operations. So how should we use
custody-unlocking in such scenarios?

### Chained Transactions

[Chained transaction](https://talk.nervos.org/t/non-blocking-chained-transaction-and-its-applications-in-ckb/6649), if
the system uses this solution as the serializing solution, then custody-unlocking can still be used.

### Aggregator + Messaging Cell(TODO)

// TODO with a messaging cell example

### Aggregator + Verifying Off-chain Signed Messages(TODO)

// TODO with a signData example
