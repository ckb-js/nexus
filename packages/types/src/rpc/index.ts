import { Config, NetworkConfig, TrustedHost } from '../services';

/**
 * Exposed RPC methods for the wallet, the `debug_` prefix is for development purpose only,
 * and will be removed in the production version
 * @example
 * To communicate with the wallet, we use the `window.ckb.request` method.
 * The `window.ckb` object is injected by the wallet
 *
 * ```js
 * await window.ckb.request({ method: "wallet_enable" })
 * ```
 */
export interface RpcMethods {
  /**
   * If a dApp is the first time to connect to the wallet,
   * it needs to call this method to enable the wallet for the dApp.
   * After calling this method, we can see the dApp in the whitelist
   */
  wallet_enable(): Promise<void>;

  /**
   * Get the wallet config
   */
  debug_getConfig(): Promise<Config>;
}

export type { Config, NetworkConfig, TrustedHost };
