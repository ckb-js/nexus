export interface Events {
  networkChanged: (network: NetworkName) => void;
}

/**
 * Network name, similar to Ethereum's network version, "ckb" for mainnet, "ckb_testnet" for testnet
 *
 * @see {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-chaininfo CKB Chaininfo}
 */
export type NetworkName = 'ckb' | 'ckb_testnet' | string;
