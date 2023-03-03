# Events

## `networkChanged`

Emitted when the network changes.

### Parameters

- `networkName`: `'ckb' | 'ckb_testnet' | string`;

### Example

```js
ckb.on('networkChanged', (networkName) => {
  console.log(networkName);
});
```
