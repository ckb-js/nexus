
<a name="interfacesrpcmethodsmd"></a>

# Interface: RpcMethods

Exposed RPC methods for the wallet, the `debug_` prefix is for development purpose only,
and will be removed in the production version

**`Example`**

To communicate with the wallet, we use the `window.ckb.request` method.
The `window.ckb` object is injected by the wallet

```js
await window.ckb.request({ method: "wallet_enable" })
```

## Hierarchy

- `Wallet`

- `FullOwnership`

- `CkbMethods`

  ↳ **`RpcMethods`**

## Table of contents

### Methods

- [ckb\_getBlockchainInfo](#ckb_getblockchaininfo)
- [ckb\_sendTransaction](#ckb_sendtransaction)
- [wallet\_enable](#wallet_enable)
- [wallet\_fullOwnership\_getLiveCells](#wallet_fullownership_getlivecells)
- [wallet\_fullOwnership\_getOffChainLocks](#wallet_fullownership_getoffchainlocks)
- [wallet\_fullOwnership\_getOnChainLocks](#wallet_fullownership_getonchainlocks)
- [wallet\_fullOwnership\_signData](#wallet_fullownership_signdata)
- [wallet\_fullOwnership\_signTransaction](#wallet_fullownership_signtransaction)

## Methods

### ckb\_getBlockchainInfo

**ckb_getBlockchainInfo**(): `Promise`<`ChainInfo`\>

get the current chain info, useful when the app needs to determine what network Nexus is connected to.

**`Example`**

```ts
await window.ckb.request({ method: "ckb_getBlockchainInfo" })
```

#### Returns

`Promise`<`ChainInfo`\>

[ChainInfo](https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#method-get_blockchain_info)
<details>
<summary>show return data example</summary>

```json
{
  "alerts": [
    {
      "id": "0x2a",
      "message": "An example alert message!",
      "notice_until": "0x24bcca57c00",
      "priority": "0x1"
    }
  ],
  "chain": "ckb",
  "difficulty": "0x1f4003",
  "epoch": "0x7080018000001",
  "isInitialBlockDownload": true,
  "medianime": "0x5cd2b105"
}
```

</details>

#### Inherited from

CkbMethods.ckb\_getBlockchainInfo

___

### ckb\_sendTransaction

**ckb_sendTransaction**(`payload`): `Promise`<`string`\>

Send a transaction to current network
It's a proxy method of [CKB send_transaction](https://github.com/nervosnetwork/ckb/blob/master/rpc/README.md#method-send_transaction)
Currently it is **not** support to send transaction to a light client node.

**`Throws`**

when the transaction is invalid, or meets network issue

**`Example`**

```ts
const signedTransaction;// signed transaction with your business logic
const txHash = await window.ckb.request({ method: "ckb_sendTransaction", params: { tx: signedTransaction } });
// if your transaction is to mainnet or testnet, you can view it on https://explorer.nervos.org/transaction/${txHash}
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.outputsValidator?` | `OutputValidator` |
| `payload.tx` | `Transaction` |

#### Returns

`Promise`<`string`\>

transaction hash of the sent transaction

#### Inherited from

CkbMethods.ckb\_sendTransaction

___

### wallet\_enable

**wallet_enable**(): `Promise`<{ `nickname`: `string`  }\>

If a dApp is the first time to connect to the wallet,
it needs to call this method to enable the wallet for the dApp.
After calling this method, we can see the dApp in the whitelist

#### Returns

`Promise`<{ `nickname`: `string`  }\>

#### Inherited from

Wallet.wallet\_enable

___

### wallet\_fullOwnership\_getLiveCells

**wallet_fullOwnership_getLiveCells**(`payload?`): `Promise`<[`Paginate`](#paginate)<`Cell`\>\>

get live cells of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({
 method: 'wallet_fullOwnership_getLiveCells',
 params: {
   cursor:
     '99:0x409bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801dafb7ea1dd60616fb9e9088332e5f975a68ac28e000000000082a3220000000700000000',
   change: 'external',
 },
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload?` | `Object` | the `change` field defaults to 'external', if the `cursor` is blank, it is equivalent to `"0:0x"` and will return the first page of live cells |
| `payload.change?` | [`Bip44ChangeType`](#bip44changetype) | - |
| `payload.cursor?` | `string` | - |

#### Returns

`Promise`<[`Paginate`](#paginate)<`Cell`\>\>

live cells of current wallet with pagination info, the page size is 20
<details>
   <summary>show return data example</summary>

   ```json
   {
        "objects": [
            {
                  "cellOutput": {
                      "capacity": "0x14ace47800",
                      "lock": {
                          "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                          "hashType": "type",
                          "args": "0xe570f6b1cf07ecafe86583ff9543bfcfca585a45"
                      }
                  },
                  "data": "0x",
                  "outPoint": {
                      "txHash": "0xb9db307671e53ef75976c2ec8b3f501c2151998787581858eb84e95174dd9b5a",
                      "index": "0x0"
                  },
                  "blockNumber": "0x81d587"
              },
              {
                  "cellOutput": {
                      "capacity": "0xe8d4a51000",
                      "lock": {
                          "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                          "hashType": "type",
                          "args": "0x74444a85fba9efcd2df6bade767200aab8fee58c"
                      }
                  },
                  "data": "0x",
                  "outPoint": {
                      "txHash": "0x9368614003637ea0c547335567a3c72e263d4fe395ec7fa263cbd52609f30dae",
                      "index": "0x3"
                  },
                  "blockNumber": "0x82a31d"
              },
              {
                  "cellOutput": {
                      "capacity": "0x1a13b8600",
                      "lock": {
                          "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                          "hashType": "type",
                          "args": "0x5b6c1bb6757ebeef96181fc100cca7e4e962388e"
                      }
                  },
                  "data": "0x",
                  "outPoint": {
                      "txHash": "0xa041511f830955439a9b93c0fac6db8376d43d7de56054bc7dc8c51bda27741d",
                      "index": "0x0"
                  },
                  "blockNumber": "0x82a327"
              },
              {
                  "cellOutput": {
                      "capacity": "0xe8d4a51000",
                      "lock": {
                          "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                          "hashType": "type",
                          "args": "0x193824fe5fecf4d30871237911e79096b4ca9cbb"
                      }
                  },
                  "data": "0x",
                  "outPoint": {
                      "txHash": "0x82be78c691ae1e7d4aafa4491cdba54c33dd1ca075ba5e8f3dd3497283bde849",
                      "index": "0x0"
                  },
                  "blockNumber": "0x82a328"
              },
              {
                  "cellOutput": {
                      "capacity": "0x5d21dba000",
                      "lock": {
                          "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                          "hashType": "type",
                          "args": "0xfd822396937dab6ff35a04852b2b48c212384a3f"
                      }
                  },
                  "data": "0x",
                  "outPoint": {
                      "txHash": "0x4971ebab12b40c3662a5be6e984e27272e574bd13e9b6ffffb313d6bab453bcd",
                      "index": "0x0"
                  },
                  "blockNumber": "0x82aa99"
              }
          ],
          "cursor": "125:0x409bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801fd822396937dab6ff35a04852b2b48c212384a3f000000000082aa990000000500000000"
        }
   ```

</details>

#### Inherited from

FullOwnership.wallet\_fullOwnership\_getLiveCells

___

### wallet\_fullOwnership\_getOffChainLocks

**wallet_fullOwnership_getOffChainLocks**(`payload`): `Promise`<`Script`[]\>

get unused locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params: { change: 'external' } });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | `Object` | the `change` field defaults to 'external' |
| `payload.change?` | [`Bip44ChangeType`](#bip44changetype) | - |

#### Returns

`Promise`<`Script`[]\>

the off-chain locks of current wallet
<details>
     <summary>show return data example</summary>

```json
 [
   {
       "args": "0xc05b4506ab74c69a5ea38ec4f0e7ce4ab540bc44",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xbfed0b63e97e2022a348126c75b50f7c9f4364df",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x1830521b4d4cf93711f671d44f205f6eec606766",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x6b9bae12909f9c7eeea6a2bc8bab76f5b7835d2c",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xe502d73d571c0a87720b38fdf81a51d03e99f48f",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x82f6699f1e563d5e9fcec280da90982c6645c160",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x80b71195dc38de6fbf044d18a308cd0650e79ffb",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xe1bcaec77cfbada45e4afc44a8f3f43e64e9ac2d",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xb4efa0c3a6267a5173bc8cd671453333753376b4",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x0ac738d446c33278d5ac908c387c70265078bed7",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x8261878431542e549843c2feda68384569f80733",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x122ca47c5125cce520170901bec659cef2586150",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xc58ceee0c38eed98fd1ab8da05ba0ec05c456b4a",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x1dd233a6f5c3d52d4102d2eb4a5ba89b71fd26de",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0xd601a6c4327142ecc1b88d5d3ff51a8fb0a66ec3",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x43a0bb1729b250681c64f310312af404be402164",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x2682db25239951d9943b4e469eb38a1a6ddd1ab8",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x40a4ef24f0611b2cf93927c80177e50e87f19ec2",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x078313f8a5f03cd5570f3293848223d8a49fc71e",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   },
   {
       "args": "0x51cc96d3e509d73fd037faae2653dece708d1acd",
       "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
       "hashType": "type"
   }
 ]
 ```

</details>

#### Inherited from

FullOwnership.wallet\_fullOwnership\_getOffChainLocks

___

### wallet\_fullOwnership\_getOnChainLocks

**wallet_fullOwnership_getOnChainLocks**(`payload`): `Promise`<[`Paginate`](#paginate)<`Script`\>\>

get used locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getOnChainLocks', params: { change: "internal", cursor: "8" } });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | `Object` | the `change` field defaults to `'external'`, if the `cursor` is blank, it is equivalent to `"0"` and will return the first page of on-chain locks |
| `payload.change?` | [`Bip44ChangeType`](#bip44changetype) | - |
| `payload.cursor?` | `string` | - |

#### Returns

`Promise`<[`Paginate`](#paginate)<`Script`\>\>

on-chain locks of the current wallet with pagination info, the page size is 20
<details>
   <summary>show return data example</summary>

   ```json
   {
        "cursor": "125",
        "objects": [
            {
                "args": "0xe570f6b1cf07ecafe86583ff9543bfcfca585a45",
                "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hashType": "type"
            },
            {
                "args": "0x74444a85fba9efcd2df6bade767200aab8fee58c",
                "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hashType": "type"
            },
            {
                "args": "0x5b6c1bb6757ebeef96181fc100cca7e4e962388e",
                "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hashType": "type"
            },
            {
                "args": "0x193824fe5fecf4d30871237911e79096b4ca9cbb",
                "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hashType": "type"
            },
            {
                "args": "0xfd822396937dab6ff35a04852b2b48c212384a3f",
                "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hashType": "type"
            }
        ]
      }
   ```

</details>

#### Inherited from

FullOwnership.wallet\_fullOwnership\_getOnChainLocks

___

### wallet\_fullOwnership\_signData

**wallet_fullOwnership_signData**(`payload`): `Promise`<`string`\>

Sign a data with some lock(public key), it can be used to identify the user, such as sign in with CKB.
The data will be displayed as human-readable when it is UTF-8 encoded. Otherwise, it will be displayed as hex.
For security reasons, the data will be signed with the following steps: `signRecoverable(blake2b("Nervos Message:" + data))`

**`Example`**

```js
let locks = await window.ckb.request({
 method: 'wallet_fullOwnership_getOffChainLocks',
 params: { change: 'external' },
});
 await window.ckb.request({
   method: 'wallet_fullOwnership_signData',
   params: {
     lock: locks[0],
     data: '0xd194cc30c06b9f71fc7c474d2bb90fd2c4a7de66b121d0fdf5dcb2bcdd11c2a8a4f6d4ac5165fe013cdfb1',
   },
 });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | `Object` | `data` you would like to sign, `lock` indicates which lock you would like to use to sign the data |
| `payload.data` | `string` | - |
| `payload.lock` | `Script` | - |

#### Returns

`Promise`<`string`\>

the signature of the data if the wallet has full ownership of the lock passed in
<details>
<summary>show return data example</summary>

```json
"0xa05fcab1955bb1aaf5d6733a5ae9ff932b5c8183532c682c1d3c735e75c2e2e6690d19ad664773ac1f438051a6c47b4aafb9e914292904fe9fe83d59906e827b00"
```
</details>

#### Inherited from

FullOwnership.wallet\_fullOwnership\_signData

___

### wallet\_fullOwnership\_signTransaction

**wallet_fullOwnership_signTransaction**(`payload`): `Promise`<[`GroupedSignature`](#groupedsignature)\>

Sign a transaction via key(s) derived from current wallet

**`See`**

[CKB Transaction Structure](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0022-transaction-structure/0022-transaction-structure.md)

**`Example`**

```js
  await window.ckb.request({
   method: 'wallet_fullOwnership_signTransaction',
   params: {
     tx: {
       version: '0x0',
       cellDeps: [
         {
           outPoint: {
             txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
             index: '0x0',
           },
           depType: 'depGroup',
         },
       ],
       headerDeps: [],
       inputs: [
         {
           since: '0x0',
           previousOutput: {
             txHash: '0xd5e26a86bb2d616ad24ef39def28d26f45d9b69c636f85d271e36adb6383606c',
             index: '0x0',
           },
         },
       ],
       outputs: [
         {
           capacity: '0x2540be400',
           lock: {
             codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
             hashType: 'type',
             args: '0x477de073e7ec94aeb74184b981670e843dcb0eb2',
           },
         },
         {
           capacity: '0x150056c218',
           lock: {
             args: '0x8caa5da2c3323da6018ad39dc15da2ed7d5932d6',
             codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
             hashType: 'type',
           },
         },
       ],
       outputsData: ['0x', '0x'],
       witnesses: [
         '0x5500000010000000550000005500000041000000b6da2d194cc30c06b9f71fc7c474d2bb90fd2c4a7de66b121d0fdf5dcb2bcdd11c2a8a4f6d4ac5165fe013cdfb18f09f1578251639911f747eb9cbb661ca723600',
       ],
     },
   },
 });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | `Object` | [Transaction](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0019-data-structures/0019-data-structures.md#Transaction) |
| `payload.tx` | `Transaction` | - |

#### Returns

`Promise`<[`GroupedSignature`](#groupedsignature)\>

an array of `[lock, signature]` tuple
<details>
   <summary>show return data example</summary>

 ```json
   [
     [
       {
           "codeHash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
           "hashType": "type",
           "args": "0x477de073e7ec94aeb74184b981670e843dcb0eb2"
       },
       "0x38e4312aec9b93da8d66742af8ddfdfab8794bfb579c7ad05962c17530713e9452d04880d567b7c310bc4b18b1afe2aaecf4e573f8e751af6f60f8b6022e086e00"
     ]
   ]
 ```

</details>

#### Inherited from

FullOwnership.wallet\_fullOwnership\_signTransaction


<a name="readmemd"></a>

# @nexus-wallet/protocol

## Table of contents

### Interfaces

- [RpcMethods](#interfacesrpcmethodsmd)

### Type Aliases

- [Bip44ChangeType](#bip44changetype)
- [Cursor](#cursor)
- [GroupedSignature](#groupedsignature)
- [HexString](#hexstring)
- [Paginate](#paginate)
- [Signature](#signature)

## Type Aliases

### Bip44ChangeType

 **Bip44ChangeType**: ``"external"`` \| ``"internal"``

The **external** chain is used for addresses that are meant to be visible outside the wallet, e.g. for receiving payments.
The **internal** chain is used for addresses which are NOT meant to be visible outside the wallet, e.g. for return transaction change

**`See`**

[BIP44 Change](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#change)

___

### Cursor

 **Cursor**: `string`

A cursor is an encoded string that represents a position in a list of objects. Nexus uses cursor pagination to
paginate through lists of objects, e.g. scripts, cells

___

### GroupedSignature

 **GroupedSignature**: [`Script`, [`Signature`](#signature)][]

___

### HexString

 **HexString**: `string`

HexString represents string starts with "0x" and followed by even number(including empty) of [0-9a-fA-F] characters.

___

### Paginate

 **Paginate**<`T`\>: `Object`

A paginated list of objects.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the objects in the list. |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cursor` | [`Cursor`](#cursor) |
| `objects` | `T`[] |

___

### Signature

 **Signature**: [`HexString`](#hexstring)
