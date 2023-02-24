import {
  GetOnChainLocksPayload,
  GetOffChainLocksPayload,
  GetLiveCellsPayload,
  SignDataPayload,
  SignTransactionPayload,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { Cell, Script } from '@ckb-lumos/lumos';
import { Modules } from '../services';
import { Call, CallMap, Paginate } from '@nexus-wallet/types';
import { Signature, GroupedSignature } from '@nexus-wallet/types/lib/injected';

export interface WalletMethods extends CallMap {
  wallet_enable: Call<void, void>;
  wallet_isEnabled: Call<void, boolean>;
  wallet_getNetworkName: Call<void, string>;

  wallet_fullOwnership_getOffChainLocks: Call<GetOffChainLocksPayload, Promise<Script[]>>;
  wallet_fullOwnership_getOnChainLocks: Call<GetOnChainLocksPayload, Promise<Paginate<Script>>>;
  wallet_fullOwnership_getLiveCells: Call<GetLiveCellsPayload, Promise<Paginate<Cell>>>;
  wallet_fullOwnership_signData: Call<SignDataPayload, Promise<Signature>>;
  wallet_fullOwnership_signTransaction: Call<SignTransactionPayload, Promise<GroupedSignature>>;

  wallet_ruleBasedOwnership_getOffChainLocks: Call<GetOffChainLocksPayload, Promise<Script[]>>;
  wallet_ruleBasedOwnership_getOnChainLocks: Call<GetOnChainLocksPayload, Promise<Paginate<Script>>>;
  wallet_ruleBasedOwnership_getLiveCells: Call<GetLiveCellsPayload, Promise<Paginate<Cell>>>;
  wallet_ruleBasedOwnership_signData: Call<SignDataPayload, Promise<Signature>>;
  wallet_ruleBasedOwnership_signTransaction: Call<SignTransactionPayload, Promise<GroupedSignature>>;
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
