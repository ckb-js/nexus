# @nexus-wallet/detect-ckb

A simple library to detect if the `ckb` object is injected into the browser.

## Quick Start

```ts
import { detectCkb } from '@nexus-wallet/detect-ckb';

async function main() {
  const ckb = await detectCkb();
  ckb.request({ method: 'wallet_enbable' });
}
```
