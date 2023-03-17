# Getting Started

Nexus Wallet provides a set of APIs for DApp builders to interact with the wallet.

## For DApp Developers

This part is for you if you are a DApp developer, for Nexus Wallet end users, please go to [user guide](./user-guide.md). The following section introduces the APIs that Nexus provides for DApp developers, and some examples demonstrating how to use the APIs.

## The RPC interface

As described in the [arch](./arch.md) article, Nexus provides a JSON-RPC interface for the dApp to interact with the Nexus Wallet.

The pattern of calling the JSON-RPC interface is as follows:

```js
await ckb.request({
  method: <REQUEST_METHOD_NAME>,
  params: <PARAMS_OF_REQUEST>,
})
```

The request method name could be one of the following:

- wallet_enable
- wallet_fullOwnership_getOffChainLocks
- wallet_fullOwnership_getOnChainLocks
- wallet_fullOwnership_getLiveCells
- wallet_fullOwnership_signData
- wallet_fullOwnership_signTransaction

You can get the full documentation of these request methods [here](./rpc.md).

## Concepts

### Ownership

Full ownership means some locks or cells that are under full control of the wallet. Users can spend the cells or sign the data with the locks as they want.

In contrast, rule-based ownership means some locks or cells that are under partial control of the wallet. Users can only spend the cells or sign the data with the locks under certain conditions.

Currently, Nexus only supports full ownership. And the full ownership only supports secp256k1 lock for now.

### Off-chain/On-chain Locks

Once the user has initialized the Nexus Wallet, the Nexus Wallet will derive locks for the user. These locks may have some transactions on the CKB chain, or not.

Off-chain locks are the locks that have no transactions on the CKB chain. On-chain locks are the locks that have some transactions on the CKB chain.

Thus off-chain locks are never used on the CKB chain. For privacy reasons, we suggest users use off-chain locks to receive CKB or tokens, this is one big advantage of UTXO model compared to the account model.

### External/Internal Locks

External locks are used to receive CKB or tokens from other users. Internal locks are used to receive CKB or token changes from the transactions that are initiated by the user.

### Live Cells

Live Cells are the cells that are alive on the CKB chain, they can be spent by the controller of its lock. It's just another name for Unspent-Transaction-Output (UTXO).

## The First Example

You can check out the [online example](https://githubbox.com/ckb-js/nexus/tree/develop/examples/nexus-example) to have a hands-on experience of Nexus Wallet.

## Other references

You can find a complete demo of transferring CKB with the Nexus Wallet in [Nexus-Demo](https://github.com/zhangyouxin/demo-nexus/blob/main/pages/index.tsx#L140-L246)
