import { Promisable } from '../base';

export interface ConfigService {
  getConfig(): Promisable<Config>;
  setConfig(payload: { config: Partial<Config> }): Promisable<void>;

  getNetworks(): Promisable<NetworkConfig[]>;
  addNetwork(payload: { network: NetworkConfig }): Promisable<void>;
  removeNetwork(payload: { id: string }): Promisable<void>;
  getSelectedNetwork(): Promisable<NetworkConfig>;
  setSelectedNetwork(payload: { id: string }): Promisable<void>;

  getNickname(): Promisable<string>;
  setNickname(payload: { nickname: string }): Promisable<void>;

  addWhitelistItem(payload: { host: string }): Promisable<void>;
  removeWhitelistItem(payload: { host: string }): Promisable<void>;

  getVersion(): Promisable<void>;
}

export interface Config {
  /**
   * version of the current app
   */
  version: string;
  /**
   * the nickname of the current user, for display purpose.
   * unlike other wallet, Nexus don't use a certain address as the identity of the user
   */
  nickname: string;
  /**
   * the id of networks that is selected to connect
   */
  selectedNetwork: string;
  /**
   * a list of networks that the app can connect to
   */
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
