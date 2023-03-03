import { HexString, Script, Transaction } from '@ckb-lumos/lumos';
import { Modules } from '../services';
import { Config as NexusConfig } from '@nexus-wallet/types/lib/services/ConfigService';
import { AsyncCall, AsyncCallMap } from '@nexus-wallet/types/lib/call';

export interface WalletMethods extends AsyncCallMap {
  wallet_enable: AsyncCall<void, void>;
  wallet_isEnabled: AsyncCall<void, boolean>;
  wallet_getNetworkName: AsyncCall<void, string>;

  wallet_fullOwnership_getUnusedLocks: AsyncCall<void, Script[]>;
  wallet_fullOwnership_signData: AsyncCall<{ data: HexString }, HexString>;
  wallet_fullOwnership_signTransaction: AsyncCall<{ transaction: Transaction }, HexString>;
}

export interface DebugMethods extends AsyncCallMap {
  debug_initWallet: AsyncCall<void, void>;
  debug_setConfig: AsyncCall<Partial<NexusConfig>, void>;
  debug_getConfig: AsyncCall<void, NexusConfig>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Modules>(name: K): Modules[K];

  getRequesterAppInfo(): Promise<{ url: string }>;
}

export interface RpcMethods extends WalletMethods, DebugMethods {}
