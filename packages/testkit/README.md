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

## Use with Jest

```ts
import { randomInput } from '@nexus-wallet/testkit';

const cells = Array.from({ length: 30 }).map(randomInput);
const getLiveCells = jest
  .fn()
  .mockReturnValueOnce({ cursor: randomBytes(32), objects: cells.slice(0, 20) })
  .mockReturnValueOnce({ cursor: randomBytes(32), objects: cells.slice(20, 30) });

const ckb = mockInjectedCkb().addMethod('wallet_fullOwnership_getLiveCells', getLiveCells);
const provider = new MyCustomProvider(ckb);

let collected = [];
for await (let cell of provider.collector()) {
  collected.push(cell);
}

expect(getLiveCells).toHaveBeenCalledTimes(2);
expect(collected).toMatchObject(cells);
```
