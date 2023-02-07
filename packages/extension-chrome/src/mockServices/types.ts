// TODO: remove it when the real service is ready

export interface Config {
  nickname: string;
  selectedNetwork: string;
  networks: NetworkConfig[];
  /**
   * a list of hosts that have been granted
   */
  whitelist: string[];
}

export interface NetworkConfig {
  id: string;
  displayName: string;
  networkName: NetworkName;
  rpcUrl: string;
}

/**
 * {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-chaininfo network type}
 */
export type NetworkName = 'ckb' | 'ckb_testnet' | string;
