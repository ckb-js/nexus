import { Script } from '@ckb-lumos/lumos';
import { Promisable } from '@nexus-wallet/types/lib/base';
import { Services } from '../services';
import { Call, CallMap } from '@nexus-wallet/types';

export interface RpcMethods extends CallMap {
  wallet_enable: Call<void, void>;
  wallet_isEnabled: Call<void, boolean>;
  wallet_getNetworkName: Call<void, string>;

  wallet_fullOwnership_getUnusedLocks: Call<void, Script[]>;
}

export interface InternalMethods extends CallMap {
  internal_initWallet: Call<{ password: string; nickname: string; mnemonics: string[] }, void>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Services>(name: K): Promisable<Services[K]>;
  getRequesterAppInfo(): Promise<{ url: string; favIconUrl: string }>;
}
