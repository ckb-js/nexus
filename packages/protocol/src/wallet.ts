import { Nickname } from './base';

export interface Wallet {
  /**
   * If a dApp is the first time to connect to the wallet,
   * it needs to call this method to enable the wallet for the dApp.
   * After calling this method, we can see the dApp in the whitelist
   */
  wallet_enable(): Promise<{ nickname: Nickname }>;
}
