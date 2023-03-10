# Error Handling

Errors can occur in the Nexus wallet browser extension, but we've made efforts to make them user-friendly for both
developers and end-users. Whenever an error occurs, an instance of the `Error` object is thrown, which has the following
structure:

```ts
interface Error {
  message: string;
  data?: any;
}
```

The `message` field is designed to be easy for dApps to display to end-users, while the optional `data` field provides
more detailed information about the error.

To display the error message, we recommend using the following format:

```markdown
<details>
  <summary>${error.message}</summary>
  <pre>${error.data && JSON.stringify(error.data, null, 2)}</pre>
</details>;
```

This format allows developers to debug the error by displaying more details in the `data` field if it exists.

## Debugging RPC Requests

When an RPC request fails, the error message will be printed to the console if it's not caught. If more detailed
information is needed to debug the error, the `data` field of the error object can be checked.

For example, if a request to sign a transaction fails due to a non-live cell input, the error message will be:

> Cannot resolve the cell, please check if the network is correct or if the cell is still live.

If more details about the error are needed, the `data` field of the error object can be printed. The data will indicate
which cell was resolved incorrectly, like this:

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
  .catch((error) => {
    console.log(error.message);
    console.log(error.data);
  });
```
