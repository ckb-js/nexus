import { Cell, Script } from '@ckb-lumos/lumos';
import { Promisable } from '@nexus-wallet/types/lib/base';
import {
  SignTransactionPayload,
  GroupedSignature,
  SignDataPayload,
  Signature,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { Services } from '../services';

interface RpcCall<Params, Result> {
  params: Params;
  result: Result;
}

export interface RpcMethods {
  wallet_enable: RpcCall<void, void>;
  wallet_isEnabled: RpcCall<void, boolean>;
  wallet_getNetworkName: RpcCall<void, string>;

  wallet_fullOwnership_getOffChainLocks: RpcCall<void, Script[]>;

  wallet_ruleBasedOwnership_getOffChainLocks: RpcCall<void, Script[]>;
  wallet_ruleBasedOwnership_getOnChainLocks: RpcCall<void, Script[]>;
  wallet_ruleBasedOwnership_getLiveCells: RpcCall<void, Cell[]>;
  wallet_ruleBasedOwnership_signTransaction: RpcCall<SignTransactionPayload, GroupedSignature>;
  wallet_ruleBasedOwnership_signData: RpcCall<SignDataPayload, Signature>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  resolveService<K extends keyof Services>(name: K): Promisable<Services[K]>;
  getRequesterAppInfo(): Promise<{ url: string; favIconUrl: string }>;
}
