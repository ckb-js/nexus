import { Modules } from '../services';
import { RequesterInfo } from '@nexus-wallet/types/lib/base';
import { RpcMethods as ProtocolRpcMethods } from '@nexus-wallet/types';
import { Config as NexusConfig } from '@nexus-wallet/types/lib/services/ConfigService';

export interface DebugMethods {
  debug_initWallet(): Promise<void>;
  debug_setConfig(config: Partial<NexusConfig>): Promise<void>;
  debug_getConfig(): Promise<NexusConfig>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Modules>(name: K): Modules[K];

  getRequesterAppInfo(): Promise<RequesterInfo>;
}

export interface RpcMethods extends ProtocolRpcMethods, DebugMethods {}
