# Run a CKB Dev Blockchain

## Why

With a dev blockchain, you can connect your Nexus wallet to it and test your DApp locally.

## Download the latest CKB Binary

[github release page](https://github.com/nervosnetwork/ckb/releases)

## Initialize the Configuration

```bash
$ mkdir dev-blockchain
$ cd dev-blockchain
$ ../ckb init --chain dev

$ tree .
```

then you get a directory structure like this:

<image width="300" src="./assets/tree.png">

## Customize the Configuration

Modify the args and message parameters in the `ckb.toml` file under the `block_assembler` section:

```toml
[block_assembler]
code_hash = "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8"
args = "0x8d627decece439977a3a0a97815b63debaff2874" # Change this to your lock_arg value if you want.
hash_type = "type"
message = "0x"
```

Modify the modules in the `ckb.toml` file under the `rpc` section:

```toml
[rpc]
modules = ["Net", "Pool", "Miner", "Chain", "Stats", "Subscription", "Experiment", "Debug", "Indexer"] # Add "Indexer" module
```

To produce blocks more quickly, modify the `value` parameter in the `ckb-miner.toml` file under the `miner.workers` section:

```toml
[[miner.workers]]
value = 500  # in million seconds
```

To test Nervos DAO faster, modify the `genesis_epoch_length` parameter in the `specs/dev.toml` file under the `params` section:

```toml
[params]
genesis_epoch_length = 1
```

To get some CKB from the genesis block, add a `genesis.issued_cells` block in the `specs/dev.toml` file before the `params` section:

```toml
[[genesis.issued_cells]]
capacity = 10_000_00000000 # amount of CKBs in shannons
lock.code_hash = "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8"
lock.args = "0x470dcdc5e44064909650113a274b3b36aecb6dc7" # change this to your lock args
lock.hash_type = "type"
```

## Start the CKB Node

```bash
$ ../ckb run
```

<details>

<summary> click to see CKB node output </summary>

```log
2020-06-05 18:31:14.970 +08:00 main INFO sentry  sentry is disabled
2020-06-05 18:31:15.058 +08:00 main INFO ckb-db  Initialize a new database
2020-06-05 18:31:15.136 +08:00 main INFO ckb-db  Init database version 20191127135521
2020-06-05 18:31:15.162 +08:00 main INFO ckb-memory-tracker  track current process: unsupported
2020-06-05 18:31:15.164 +08:00 main INFO main  ckb version: 0.32.1 (9ebc9ce 2020-05-29)
2020-06-05 18:31:15.164 +08:00 main INFO main  chain genesis hash: 0x823b2ff5785b12da8b1363cac9a5cbe566d8b715a4311441b119c39a0367488c
2020-06-05 18:31:15.166 +08:00 main INFO ckb-network  Generate random key
2020-06-05 18:31:15.166 +08:00 main INFO ckb-network  write random secret key to "/PATH/ckb_v0.32.1_x86_64-apple-darwin/data/network/secret_key"
2020-06-05 18:31:15.177 +08:00 NetworkRuntime INFO ckb-network  p2p service event: ListenStarted { address: "/ip4/0.0.0.0/tcp/8115" }
2020-06-05 18:31:15.179 +08:00 NetworkRuntime INFO ckb-network  Listen on address: /ip4/0.0.0.0/tcp/8115/p2p/QmSHk4EucevEuX76Q44hEdYpRxr3gyDmbKtnMQ4kxGaJ6m
2020-06-05 18:31:15.185 +08:00 main INFO ckb-db  Initialize a new database
2020-06-05 18:31:15.211 +08:00 main INFO ckb-db  Init database version 20191201091330
2020-06-05 18:31:26.586 +08:00 ChainService INFO ckb-chain  block: 1, hash: 0x47995f78e95202d2c85ce11bce2ee16d131a57d871f7d93cd4c90ad2a8220bd1, epoch: 0(1/1000), total_diff: 0x200, txs: 1
```

The dev blockchain is now running, rpc endpoint is: `http://localhost:8114`

</details>

## Start the CKB Miner

Start a miner to pack transactions and generate blocks:

```bash
# open a new terminal tab
$ ../ckb miner
```

<details>

<summary> click to see miner output </summary>

```log
2020-06-05 18:31:21.558 +08:00 main INFO sentry  sentry is disabled
Dummy-Worker ⠁ [00:00:00]
Found! #1 0x47995f78e95202d2c85ce11bce2ee16d131a57d871f7d93cd4c90ad2a8220bd1
Found! #2 0x19978085abfa6204471d42bfb279eac0c20e3b81745b48c4dcaea85643e301f9
Found! #3 0x625b230f84cb92bcd9cb0bf76d1397c1d948ab25c19df3c4edc246a765f94427
Found! #4 0x4550fb3b62d9d5ba4d3926db6704b25b90438cfb67037d253ceceb2d86ffdbf7
```

</details>

## How to Reset the CKB Dev Blockchain

Sometimes you need to reset the blockchain for some testing purpose.

Firstly, stop the CKB node and miner, then remove the `data` directory, and then restart the CKB node and miner:

```bash
$ rm -rf data
```

## References

- https://docs.nervos.org/docs/basics/guides/devchain
