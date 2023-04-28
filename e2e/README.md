# E2E

## Quick Start

```sh
npm run test -w @nexus-wallet/e2e

# run in headless mode
HEADLESS=true npm run test -w @nexus-wallet/e2e

# any jest cli options can be passed to the test command, e.g.
# increase timeout, default is 5s, the following example is 20s
npm run test -w @nexus-wallet/e2e -- --testTimeout 20000
```

## Add a New Case

Cases are located in [tests](./tests) directory. We have provided an example
case [wallet-enable.test.ts](./tests/wallet-enable.test.ts)

To quick setup a new case, you can use `DefaultTestEnv.setup`

```ts
import { DefaultTestEnv } from '@nexus-wallet/e2e/helpers';

// To skip the creation of a new wallet, `initWalletWithDefaults` can be set to true
// wallet will be initialized with
// {
//   nickname: 'Nexus Dev',
//   mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
//   password: '12345678',
// }
DefaultTestEnv.setup({ initWalletWithDefaults: true });

describe('Some scenario', () => {
  it('should do something', async () => {
    // a ckb object is available in the global scope for each test case
    ckb.request({ method: 'some_method' });
  });

  it('should do something else', async () => {
    // or you can use the playwright via testEnv.context
    const page = await testEnv.context.newPage();
    const ckbInPage2 = testEnv.getInjectedCkb(page);
  });
});
```

The `DefaultTestEnv.setup` will inject a `ckb` and `testEnv` object to the global scope, and also create a new wallet for EACH test case.
If you want to use one wallet in multiple test cases, you can use `new DefaultTestEnv` to instead of `DefaultTestEnv.setup`

```ts
describe('Some scenario', () => {
  it('should do something', async () => {
    const testEnv = new DefaultTestEnv();
    const ckb = testEnv.getInjectedCkb();
    await ckb.request({ method: 'some_method' });

    testEnv.dispose();
  });

  it('should do something else', async () => {
    const testEnv = new DefaultTestEnv();
    const ckb = testEnv.getInjectedCkb();
    await ckb.request({ method: 'some_method' });

    testEnv.dispose();
  });
});
```

## Start a E2E Node

The `CkbNode` is a class to help to launch CKB node(s) for e2e tests.

```ts
import { CkbNode } from '../helpers';

const node = CkbNode.create();
await node.start();

const rpc = new Rpc(node.rpcUrl);
await rpc.getTipBlockNumber();

// don't forget to stop the node if you don't need it anymore
await node.stop();
```

### Where Is the Node Data?

```ts
console.log(CkbNode.paths);
```

### Download CKB via Proxy

```sh
export https_proxy=https://127.0.0.1:1087
```

### Claim the Test Token

```ts
const privateKeys = node.issuedPrivateKey();
```
