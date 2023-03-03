
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

## Methods

### debug\_getConfig

▸ **debug_getConfig**(): `Promise`<[`Config`](#configmd)\>

Get the wallet config

#### Returns

`Promise`<[`Config`](#configmd)\>

#### Defined in

[rpc/index.ts:25](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/rpc/index.ts#L25)

___

### wallet\_enable

▸ **wallet_enable**(): `Promise`<`void`\>

If a dApp is the first time to connect to the wallet,
it needs to call this method to enable the wallet for the dApp.
After calling this method, we can see the dApp in the whitelist

#### Returns

`Promise`<`void`\>

#### Defined in

[rpc/index.ts:20](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/rpc/index.ts#L20)


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

[services/ConfigService.ts:83](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L83)

___

### nickname

• **nickname**: `string`

the nickname of the current user, for display purpose.
unlike other wallet, Nexus don't use a certain address as the identity of the user

#### Defined in

[services/ConfigService.ts:75](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L75)

___

### selectedNetwork

• **selectedNetwork**: `string`

the id of networks that is selected to connect

#### Defined in

[services/ConfigService.ts:79](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L79)

___

### version

• **version**: `string`

version of the current app

#### Defined in

[services/ConfigService.ts:70](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L70)

___

### whitelist

• **whitelist**: [`TrustedHost`](#trustedhostmd)[]

a list of hosts that have been granted

#### Defined in

[services/ConfigService.ts:87](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L87)


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

[services/ConfigService.ts:97](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L97)

___

### id

• **id**: `string`

#### Defined in

[services/ConfigService.ts:96](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L96)

___

### networkName

• **networkName**: `string`

#### Defined in

[services/ConfigService.ts:98](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L98)

___

### rpcUrl

• **rpcUrl**: `string`

#### Defined in

[services/ConfigService.ts:99](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L99)


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

[services/ConfigService.ts:92](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L92)

___

### host

• **host**: `string`

#### Defined in

[services/ConfigService.ts:91](https://github.com/ckb-js/nexus/blob/19af755/packages/types/src/services/ConfigService.ts#L91)
