import { Cell, Script } from '@ckb-lumos/lumos';
import { Modules } from '../services';
import { Paginate } from '@nexus-wallet/types';
import {
  GetOffChainLocksPayload,
  GetPaginateItemsPayload,
  GetUsedLocksPayload,
  GroupedSignature,
  Signature,
  SignDataPayload,
  SignTransactionPayload,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { Config as NexusConfig } from '@nexus-wallet/types/lib/services/ConfigService';
import { AsyncCall, AsyncCallMap } from '@nexus-wallet/types/lib/call';

export interface WalletMethods extends AsyncCallMap {
  wallet_enable: AsyncCall<void, void>;
  wallet_isEnabled: AsyncCall<void, boolean>;
  wallet_getNetworkName: AsyncCall<void, string>;

  wallet_fullOwnership_getOffChainLocks: AsyncCall<GetOffChainLocksPayload, Script[]>;
  wallet_fullOwnership_getOnChainLocks: AsyncCall<GetUsedLocksPayload, Paginate<Script>>;
  wallet_fullOwnership_getLiveCells: AsyncCall<GetPaginateItemsPayload, Paginate<Cell>>;
  wallet_fullOwnership_signData: AsyncCall<SignDataPayload, Signature>;
  wallet_fullOwnership_signTransaction: AsyncCall<SignTransactionPayload, GroupedSignature>;
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

export type RPCMethodHandler<T extends keyof RpcMethods> = (
  param: RpcMethods[T]['params'],
  context: ServerParams,
) => RpcMethods[T]['result'];

export interface RpcMethods extends WalletMethods, DebugMethods {}
