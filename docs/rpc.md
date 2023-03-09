
<a name="rpcmethodsmd"></a>

# Interface: RpcMethods

Exposed RPC methods for the wallet, the `debug_` prefix is for development purpose only,
and will be removed in the production version

**`Example`**

To communicate with the wallet, we use the `window.ckb.request` method.
The `window.ckb` object is injected by the wallet

```js
await window.ckb.request({ method: "wallet_enable" })
```

## Table of contents

### Methods

- [debug\_getConfig](#debug_getconfig)
- [wallet\_enable](#wallet_enable)
- [wallet\_fullOwnership\_getLiveCells](#wallet_fullownership_getlivecells)
- [wallet\_fullOwnership\_getOffChainLocks](#wallet_fullownership_getoffchainlocks)
- [wallet\_fullOwnership\_getOnChainLocks](#wallet_fullownership_getonchainlocks)
- [wallet\_fullOwnership\_signData](#wallet_fullownership_signdata)
- [wallet\_fullOwnership\_signTransaction](#wallet_fullownership_signtransaction)

## Methods

### debug\_getConfig

▸ **debug_getConfig**(): `Promise`<[`Config`](#configmd)\>

Get the wallet config

#### Returns

`Promise`<[`Config`](#configmd)\>

#### Defined in

[rpc/index.ts:104](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L104)

___

### wallet\_enable

▸ **wallet_enable**(): `Promise`<`void`\>

If a dApp is the first time to connect to the wallet,
it needs to call this method to enable the wallet for the dApp.
After calling this method, we can see the dApp in the whitelist

#### Returns

`Promise`<`void`\>

#### Defined in

[rpc/index.ts:44](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L44)

___

### wallet\_fullOwnership\_getLiveCells

▸ **wallet_fullOwnership_getLiveCells**(`payload?`): `Promise`<`Paginate`<`Cell`\>\>

get live cells of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getLiveCells', params: {cursor: "0:0x" }})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload?` | [`GetLiveCellsPayload`](#getlivecellspayloadmd) | the `change` field defaults to 'external', if the `cursor` is blank, it is equivalent to `"0:0x"` and will return the first page of live cells |

#### Returns

`Promise`<`Paginate`<`Cell`\>\>

live cells of current wallet with pagination info, the page size is 20

#### Defined in

[rpc/index.ts:77](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L77)

___

### wallet\_fullOwnership\_getOffChainLocks

▸ **wallet_fullOwnership_getOffChainLocks**(`payload`): `Promise`<`Script`[]\>

get unused locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params: { change: 'external' } });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`GetOffChainLocksPayload`](#getoffchainlockspayloadmd) | the `change` field defaults to 'external' |

#### Returns

`Promise`<`Script`[]\>

the off-chain locks of current wallet

#### Defined in

[rpc/index.ts:55](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L55)

___

### wallet\_fullOwnership\_getOnChainLocks

▸ **wallet_fullOwnership_getOnChainLocks**(`payload`): `Promise`<`Paginate`<`Script`\>\>

get used locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getOnChainLocks', params: { change: "internal", cursor: "0" } });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`GetOnChainLocksPayload`](#getonchainlockspayloadmd) | the `change` field defaults to `'external'`, if the `cursor` is blank, it is equivalent to `"0"` and will return the first page of on-chain locks |

#### Returns

`Promise`<`Paginate`<`Script`\>\>

on-chain locks of the current wallet with pagination info, the page size is 20

#### Defined in

[rpc/index.ts:66](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L66)

___

### wallet\_fullOwnership\_signData

▸ **wallet_fullOwnership_signData**(`payload`): `Promise`<`string`\>

sign a transaction with the wallet

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_signData', params: { data: '0x1234', lock: <YOUR_LOCK> }})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`SignDataPayload`](#signdatapayload) | `data` you would like to sign, `lock` indicates which lock you would like to use to sign the data |

#### Returns

`Promise`<`string`\>

the signature of the data if the wallet has full ownership of the lock passed in

#### Defined in

[rpc/index.ts:99](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L99)

___

### wallet\_fullOwnership\_signTransaction

▸ **wallet_fullOwnership_signTransaction**(`payload`): `Promise`<[`GroupedSignature`](#groupedsignature)\>

sign a transaction with the wallet

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_signTransaction', params: { tx: <YOUR_TRANSACTION> }})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`SignTransactionPayload`](#signtransactionpayloadmd) | the `tx` is your transaction |

#### Returns

`Promise`<[`GroupedSignature`](#groupedsignature)\>

an array of [lock, signature] tuple

#### Defined in

[rpc/index.ts:88](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/rpc/index.ts#L88)


<a name="configmd"></a>

# Interface: Config

## Table of contents

### Properties

- [networks](#networks)
- [nickname](#nickname)
- [selectedNetwork](#selectednetwork)
- [version](#version)
- [whitelist](#whitelist)

## Properties

### networks

• **networks**: [`NetworkConfig`](#networkconfigmd)[]

a list of networks that the app can connect to

#### Defined in

[services/ConfigService.ts:83](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L83)

___

### nickname

• **nickname**: `string`

the nickname of the current user, for display purpose.
unlike other wallet, Nexus don't use a certain address as the identity of the user

#### Defined in

[services/ConfigService.ts:75](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L75)

___

### selectedNetwork

• **selectedNetwork**: `string`

the id of networks that is selected to connect

#### Defined in

[services/ConfigService.ts:79](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L79)

___

### version

• **version**: `string`

version of the current app

#### Defined in

[services/ConfigService.ts:70](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L70)

___

### whitelist

• **whitelist**: [`TrustedHost`](#trustedhostmd)[]

a list of hosts that have been granted

#### Defined in

[services/ConfigService.ts:87](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L87)


<a name="getlivecellspayloadmd"></a>

# Interface: GetLiveCellsPayload

## Hierarchy

- `GetPaginateItemsPayload`

  ↳ **`GetLiveCellsPayload`**

## Table of contents

### Properties

- [cursor](#cursor)

## Properties

### cursor

• `Optional` **cursor**: `string`

#### Inherited from

GetPaginateItemsPayload.cursor

#### Defined in

[services/OwnershipService.ts:29](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/OwnershipService.ts#L29)


<a name="getoffchainlockspayloadmd"></a>

# Interface: GetOffChainLocksPayload

## Hierarchy

- `FilterPayload`

  ↳ **`GetOffChainLocksPayload`**

## Table of contents

### Properties

- [change](#change)

## Properties

### change

• `Optional` **change**: ``"external"`` \| ``"internal"``

#### Inherited from

FilterPayload.change

#### Defined in

[services/OwnershipService.ts:33](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/OwnershipService.ts#L33)


<a name="getonchainlockspayloadmd"></a>

# Interface: GetOnChainLocksPayload

## Hierarchy

- `GetPaginateItemsPayload`

- `FilterPayload`

  ↳ **`GetOnChainLocksPayload`**

## Table of contents

### Properties

- [change](#change)
- [cursor](#cursor)

## Properties

### change

• `Optional` **change**: ``"external"`` \| ``"internal"``

#### Inherited from

FilterPayload.change

#### Defined in

[services/OwnershipService.ts:33](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/OwnershipService.ts#L33)

___

### cursor

• `Optional` **cursor**: `string`

#### Inherited from

GetPaginateItemsPayload.cursor

#### Defined in

[services/OwnershipService.ts:29](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/OwnershipService.ts#L29)


<a name="networkconfigmd"></a>

# Interface: NetworkConfig

## Table of contents

### Properties

- [displayName](#displayname)
- [id](#id)
- [networkName](#networkname)
- [rpcUrl](#rpcurl)

## Properties

### displayName

• **displayName**: `string`

#### Defined in

[services/ConfigService.ts:97](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L97)

___

### id

• **id**: `string`

#### Defined in

[services/ConfigService.ts:96](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L96)

___

### networkName

• **networkName**: `string`

#### Defined in

[services/ConfigService.ts:98](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L98)

___

### rpcUrl

• **rpcUrl**: `string`

#### Defined in

[services/ConfigService.ts:99](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L99)


<a name="signtransactionpayloadmd"></a>

# Interface: SignTransactionPayload

## Table of contents

### Properties

- [tx](#tx)

## Properties

### tx

• **tx**: `Transaction`

#### Defined in

[services/OwnershipService.ts:41](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/OwnershipService.ts#L41)


<a name="trustedhostmd"></a>

# Interface: TrustedHost

## Table of contents

### Properties

- [favicon](#favicon)
- [host](#host)

## Properties

### favicon

• **favicon**: `string`

#### Defined in

[services/ConfigService.ts:92](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L92)

___

### host

• **host**: `string`

#### Defined in

[services/ConfigService.ts:91](https://github.com/zhangyouxin/nexus/blob/c078f80/packages/types/src/services/ConfigService.ts#L91)
