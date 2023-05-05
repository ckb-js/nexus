# FAQ

We have collected some good first questions here

- [How to get a CKB address through RPC interface?](https://github.com/ckb-js/nexus/issues/238)

## How To Determine if the Wallet Is Connected Successfully in the DApp?

You can call `wallet_enable` method and check if it is rejected or not.

```js
try {
  await ckb.request({ method: 'wallet_enable' });
} catch {
  // wallet not connected, maybe user rejected the request
  console.log('wallet not connected');
}
```
