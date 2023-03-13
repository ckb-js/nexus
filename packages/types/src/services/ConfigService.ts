import { Promisable } from '../base';

export interface ConfigService {
  /**
   * get a config object
   */
  getConfig(): Promisable<Config>;
  setConfig(payload: { config: Partial<Config> | ((config: Config) => void) }): Promisable<void>;

  /**
   * get a list of networks that the app can connect to
   */
  getNetworks(): Promisable<NetworkConfig[]>;
  /**
   * add a network to the list of networks that the app can connect to
   * @param payload
   */
  addNetwork(payload: { network: NetworkConfig }): Promisable<void>;
  /**
   * remove a network from the list of networks that the app can connect to
   * @param payload
   */
  removeNetwork(payload: { id: string }): Promisable<void>;
  /**
   * get the network that is selected to connect
   */
  getSelectedNetwork(): Promisable<NetworkConfig>;
  /**
   * set the network that is selected to connect
   * @param payload
   */
  setSelectedNetwork(payload: { id: string }): Promisable<void>;

  /**
   * get the nickname of the current user, for display purpose
   */
  getNickname(): Promisable<string>;

  /**
   * set the nickname of the current user, for display purpose
   * @param payload
   */
  setNickname(payload: { nickname: string }): Promisable<void>;

  /**
   * get a list of hosts that have been granted
   */
  getWhitelist(): Promisable<TrustedHost[]>;
  /**
   * add a host to whitelist to grant permission
   * @param payload
   */
  addWhitelistItem(payload: TrustedHost): Promisable<void>;
  /**
   * remove a host from whitelist to revoke permission
   * @param payload
   */
  removeWhitelistItem(payload: { host: string }): Promisable<void>;

  /**
   * to get current Nexus version
   */
  getVersion(): Promisable<string>;
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
  whitelist: TrustedHost[];
}

export interface TrustedHost {
  host: string;
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
