<a name="rpcmethodsmd"></a>

# Interface: RpcMethods

Exposed RPC methods for the wallet, the `debug_` prefix is for development purpose only,
and will be removed in the production version

**`Example`**

To communicate with the wallet, we use the `window.ckb.request` method.
The `window.ckb` object is injected by the wallet

```js
await window.ckb.request({ method: 'wallet_enable' });
```

## Table of contents

### Methods

- [debug_getConfig](#debug_getconfig)
- [wallet_enable](#wallet_enable)
- [wallet_fullOwnership_getLiveCells](#wallet_fullownership_getlivecells)
- [wallet_fullOwnership_getOffChainLocks](#wallet_fullownership_getoffchainlocks)
- [wallet_fullOwnership_getOnChainLocks](#wallet_fullownership_getonchainlocks)
- [wallet_fullOwnership_signData](#wallet_fullownership_signdata)
- [wallet_fullOwnership_signTransaction](#wallet_fullownership_signtransaction)

## Methods

### debug_getConfig

▸ **debug_getConfig**(): `Promise`<[`Config`](#configmd)\>

Get the wallet config

#### Returns

`Promise`<[`Config`](#configmd)\>

#### Defined in

[rpc/index.ts:90](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L90)

---

### wallet_enable

▸ **wallet_enable**(): `Promise`<`void`\>

If a dApp is the first time to connect to the wallet,
it needs to call this method to enable the wallet for the dApp.
After calling this method, we can see the dApp in the whitelist

#### Returns

`Promise`<`void`\>

#### Defined in

[rpc/index.ts:30](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L30)

---

### wallet_fullOwnership_getLiveCells

▸ **wallet_fullOwnership_getLiveCells**(`payload?`): `Promise`<`Paginate`<`Cell`\>\>

get live cells of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getLiveCells', params: { cursor: '0:0x' } });
```

#### Parameters

| Name       | Type                      | Description                                                                                                                                    |
| :--------- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload?` | `GetPaginateItemsPayload` | the `change` field defaults to 'external', if the `cursor` is blank, it is equivalent to `"0:0x"` and will return the first page of live cells |

#### Returns

`Promise`<`Paginate`<`Cell`\>\>

live cells of current wallet with pagination info, the page size is 20

#### Defined in

[rpc/index.ts:63](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L63)

---

### wallet_fullOwnership_getOffChainLocks

▸ **wallet_fullOwnership_getOffChainLocks**(`payload`): `Promise`<`Script`[]\>

get unused locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params: { change: 'external' } });
```

#### Parameters

| Name      | Type                      | Description                               |
| :-------- | :------------------------ | :---------------------------------------- |
| `payload` | `GetOffChainLocksPayload` | the `change` field defaults to 'external' |

#### Returns

`Promise`<`Script`[]\>

the off-chain locks of current wallet

#### Defined in

[rpc/index.ts:41](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L41)

---

### wallet_fullOwnership_getOnChainLocks

▸ **wallet_fullOwnership_getOnChainLocks**(`payload`): `Promise`<`Paginate`<`Script`\>\>

get used locks of which the wallet has full ownership

**`Example`**

```js
await window.ckb.request({
  method: 'wallet_fullOwnership_getOnChainLocks',
  params: { change: 'internal', cursor: '0' },
});
```

#### Parameters

| Name      | Type                     | Description                                                                                                                                       |
| :-------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `payload` | `GetOnChainLocksPayload` | the `change` field defaults to `'external'`, if the `cursor` is blank, it is equivalent to `"0"` and will return the first page of on-chain locks |

#### Returns

`Promise`<`Paginate`<`Script`\>\>

on-chain locks of the current wallet with pagination info, the page size is 20

#### Defined in

[rpc/index.ts:52](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L52)

---

### wallet_fullOwnership_signData

▸ **wallet_fullOwnership_signData**(`payload`): `Promise`<`string`\>

sign a transaction with the wallet

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_signData', params: { data: '0x1234', lock: <YOUR_LOCK> }})
```

#### Parameters

| Name      | Type              | Description                                                                                       |
| :-------- | :---------------- | :------------------------------------------------------------------------------------------------ |
| `payload` | `SignDataPayload` | `data` you would like to sign, `lock` indicates which lock you would like to use to sign the data |

#### Returns

`Promise`<`string`\>

the signature of the data if the wallet has full ownership of the lock passed in

#### Defined in

[rpc/index.ts:85](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L85)

---

### wallet_fullOwnership_signTransaction

▸ **wallet_fullOwnership_signTransaction**(`payload`): `Promise`<`GroupedSignature`\>

sign a transaction with the wallet

**`Example`**

```js
await window.ckb.request({ method: 'wallet_fullOwnership_signTransaction', params: { tx: <YOUR_TRANSACTION> }})
```

#### Parameters

| Name      | Type                     | Description                  |
| :-------- | :----------------------- | :--------------------------- |
| `payload` | `SignTransactionPayload` | the `tx` is your transaction |

#### Returns

`Promise`<`GroupedSignature`\>

an array of [lock, signature] tuple

#### Defined in

[rpc/index.ts:74](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/rpc/index.ts#L74)

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

[services/ConfigService.ts:83](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L83)

---

### nickname

• **nickname**: `string`

the nickname of the current user, for display purpose.
unlike other wallet, Nexus don't use a certain address as the identity of the user

#### Defined in

[services/ConfigService.ts:75](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L75)

---

### selectedNetwork

• **selectedNetwork**: `string`

the id of networks that is selected to connect

#### Defined in

[services/ConfigService.ts:79](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L79)

---

### version

• **version**: `string`

version of the current app

#### Defined in

[services/ConfigService.ts:70](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L70)

---

### whitelist

• **whitelist**: [`TrustedHost`](#trustedhostmd)[]

a list of hosts that have been granted

#### Defined in

[services/ConfigService.ts:87](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L87)

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

[services/ConfigService.ts:97](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L97)

---

### id

• **id**: `string`

#### Defined in

[services/ConfigService.ts:96](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L96)

---

### networkName

• **networkName**: `string`

#### Defined in

[services/ConfigService.ts:98](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L98)

---

### rpcUrl

• **rpcUrl**: `string`

#### Defined in

[services/ConfigService.ts:99](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L99)

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

[services/ConfigService.ts:92](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L92)

---

### host

• **host**: `string`

#### Defined in

[services/ConfigService.ts:91](https://github.com/ckb-js/nexus/blob/1c75fa8/packages/types/src/services/ConfigService.ts#L91)
