import { Script } from '@ckb-lumos/lumos';
import { Promisable } from '@nexus-wallet/types/lib/base';
import { Services } from '../services';

interface RpcCall<Params, Result> {
  params: Params;
  result: Result;
}

export interface RpcMethods {
  wallet_enable: RpcCall<void, void>;
  wallet_isEnabled: RpcCall<void, boolean>;
  wallet_getNetworkName: RpcCall<void, string>;

  wallet_fullOwnership_getUnusedLocks: RpcCall<void, Script[]>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Services>(name: K): Promisable<Services[K]>;
  getRequesterAppInfo(): Promise<{ url: string; favIconUrl: string }>;
}
