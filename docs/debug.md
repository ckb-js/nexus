# Debug

## Debugging the RPC request

When the RPC request fails, the error message will be printed in the console if we are not catching the error.
But sometimes, we may want to know more details about the error, such as the error data, to debug the error,
we can check if there is an `data` field in the error object, if so, we can print the `data` field to get more details.

### Example

Here is an example of how to debug the error.
We will request to sign a transaction with a non-live cell as the input.
The error message will be

> Cannot resolve the cell, please check if the network is correct or if the cell is still live

And if we want to know more details about the error, we can print the `data` field of the error object. The data will
tell us which cell is resolved failed

```json
{
  "txHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
  "index": "0x0"
}
```

```js
await window.ckb
  .request({
    method: 'wallet_fullOwnership_signTransaction',
    params: {
      tx: {
        version: '0x0',
        cellDeps: [
          {
            // non-live cell as the cell dep
            // 👇
            outPoint: {
              txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              index: '0x0',
            },
            depType: 'depGroup',
          },
        ],
        headerDeps: [],
        inputs: [
          {
            // non-live cell as the input
            // 👇
            since: '0x0',
            previousOutput: {
              txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
              index: '0x0',
            },
          },
        ],
        outputs: [
          {
            capacity: '0x2540be400',
            lock: {
              codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
              hashType: 'type',
              args: '0x477de073e7ec94aeb74184b981670e843dcb0eb2',
            },
          },
          {
            capacity: '0x150056c218',
            lock: {
              args: '0x8caa5da2c3323da6018ad39dc15da2ed7d5932d6',
              codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
              hashType: 'type',
            },
          },
        ],
        outputsData: ['0x', '0x'],
        witnesses: [
          '0x5500000010000000550000005500000041000000b6da2d194cc30c06b9f71fc7c474d2bb90fd2c4a7de66b121d0fdf5dcb2bcdd11c2a8a4f6d4ac5165fe013cdfb18f09f1578251639911f747eb9cbb661ca723600',
        ],
      },
    },
  })
  .then(console.log, (e) => {
    console.log(e.message, e.data);
  });
```
