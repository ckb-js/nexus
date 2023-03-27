# @nexus-wallet/testkit

A quick and dirty module to help you test your Nexus Wallet application.

## Quick Start

```ts
import { mockInjectedCkb } from '@nexus-wallet/testkit';

const ckb = mockInjectedCkb<RpcMethods>()
  .addMethod('wallet_fullOwnership_getLiveCells', async () => ({
    cursor: randomBytes(32),
    objects: generateCells({ totalCapacity: BigInt(12345) * BigInt(10) ** BigInt(8), count: 11 }),
  }))
  .addMethod('wallet_fullOwnership_getOffChainLocks', async () => Array.from({ length: 20 }).map(randomScript));
```
