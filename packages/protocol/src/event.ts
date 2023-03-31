export interface Events {
  networkChanged: (network: NetworkName) => void;
}

/**
 * Network name, similar to Ethereum's network version, "ckb" for mainnet, "ckb_testnet" for testnet
 *
 * @see {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-chaininfo CKB Chaininfo}
 * @see {@link https://github.com/nervosnetwork/ckb/tree/f56e66cfb3170fb420ac6e0ddfda7232b3e410e4/resource/specs chain specs}
 */
export type NetworkName = 'ckb' | 'ckb_testnet' | 'ckb_dev' | string;
