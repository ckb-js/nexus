import { HexString, Script, Transaction } from '@ckb-lumos/lumos';
import { Modules } from '../services';
import { Call, CallMap } from '@nexus-wallet/types';

export interface WalletMethods extends CallMap {
  wallet_enable: Call<void, void>;
  wallet_isEnabled: Call<void, boolean>;
  wallet_getNetworkName: Call<void, string>;

  wallet_fullOwnership_getUnusedLocks: Call<void, Script[]>;

  wallet_fullOwnership_signData: Call<{ data: HexString }, Promise<string>>;

  wallet_fullOwnership_signTransaction: Call<{ transaction: Transaction }, Promise<string>>;
}

export interface DebugMethods extends CallMap {
  debug_initWallet: Call<void, void>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Modules>(name: K): Modules[K];

  getRequesterAppInfo(): Promise<{ url: string }>;
}
