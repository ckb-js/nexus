# E2E

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
