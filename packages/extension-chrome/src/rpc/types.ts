import { Cell, Script } from '@ckb-lumos/lumos';
import { Modules } from '../services';
import { Call, CallMap, Paginate } from '@nexus-wallet/types';
import {
  GetOffChainLocksPayload,
  GetPaginateItemsPayload,
  GetUsedLocksPayload,
  GroupedSignature,
  Signature,
  SignDataPayload,
  SignTransactionPayload,
} from '@nexus-wallet/types/lib/services/OwnershipService';

export interface WalletMethods extends CallMap {
  wallet_enable: Call<void, void>;
  wallet_isEnabled: Call<void, boolean>;
  wallet_getNetworkName: Call<void, string>;

  wallet_fullOwnership_getOffChainLocks: Call<GetOffChainLocksPayload, Script[]>;
  wallet_fullOwnership_getOnChainLocks: Call<GetUsedLocksPayload, Paginate<Script>>;
  wallet_fullOwnership_getLiveCells: Call<GetPaginateItemsPayload, Paginate<Cell>>;
  wallet_fullOwnership_signData: Call<SignDataPayload, Signature>;
  wallet_fullOwnership_signTransaction: Call<SignTransactionPayload, GroupedSignature>;
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

export interface RpcMethods extends WalletMethods, DebugMethods {}
