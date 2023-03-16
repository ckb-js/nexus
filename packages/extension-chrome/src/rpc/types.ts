import { Modules } from '../services';
import { Config as NexusConfig } from '@nexus-wallet/types/lib/services/ConfigService';
import { AsyncCall, AsyncCallMap, Call } from '@nexus-wallet/types/lib/call';
import { RequesterInfo } from '@nexus-wallet/types/lib/base';
import { ProtocolRpcMethods } from '@nexus-wallet/types';

export type WalletMethods = {
  [MethodName in keyof ProtocolRpcMethods]: Call<
    Parameters<ProtocolRpcMethods[MethodName]>[0],
    ReturnType<ProtocolRpcMethods[MethodName]>
  >;
};

export interface DebugMethods extends AsyncCallMap {
  debug_initWallet: AsyncCall<void, void>;
  debug_setConfig: AsyncCall<Partial<NexusConfig>, void>;
  debug_getConfig: AsyncCall<void, NexusConfig>;
}

/** The RPC server handler second params */
export interface ServerParams {
  resolveService<K extends keyof Modules>(name: K): Modules[K];

  getRequesterAppInfo(): Promise<RequesterInfo>;
}

export interface RpcMethods extends WalletMethods, DebugMethods {}
