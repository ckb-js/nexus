import { Promisable } from '../base';

export interface ConfigService {
  getConfig(): Promisable<Config>;

  updateConfig(payload: { config: Partial<Config> }): Promisable<void>;

  getAvailableNetworks(): Promisable<NetworkConfig[]>;
  updateNetwork(payload: { network: NetworkConfig }): Promisable<void>;
  switchNetwork(payload: { id: string }): Promisable<void>;
  removeNetwork(payload: { id: string }): Promisable<void>;

  updateNickname(payload: { nickname: string }): Promisable<void>;

  appendWhitelistItem(payload: { host: string }): Promisable<void>;
  removeWhitelistItem(payload: { host: string }): Promisable<void>;

  getVersion(): Promisable<void>;
}

interface Config {
  /**
   * version of the current app
   */
  version: string;
  nickname: string;
  selectedNetwork: string;
  networks: NetworkConfig[];
  /**
   * a list of hosts that have been granted
   */
  whitelist: string[];
}

interface NetworkConfig {
  id: string;
  displayName: string;
  networkName: NetworkName;
  rpcUrl: string;
}

/**
 * {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-chaininfo network type}
 */
export type NetworkName = 'ckb' | 'ckb_testnet' | string;
