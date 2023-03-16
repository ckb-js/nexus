import { Nickname } from './base';

export interface Wallet {
  /**
   * If a dApp is the first time to connect to the wallet,
   * it needs to call this method to enable the wallet for the dApp.
   * After calling this method, we can see the dApp in the whitelist
   *
   * @example
   * To communicate with the wallet, we use the `window.ckb.request` method.
   * The `window.ckb` object is injected by the wallet
   *
   * ```js
   * await window.ckb.request({ method: "wallet_enable" })
   * ```
   */
  wallet_enable(): Promise<{ nickname: Nickname }>;
}
