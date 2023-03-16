import { Cell, HexString, Script, Transaction } from '@ckb-lumos/lumos';
import { BytesLike } from '@ckb-lumos/codec';
import { Paginate } from './base';

export type { RpcClient, EventClient, InjectedCkb } from '@nexus-wallet/protocol/lib/injected';

// export interface RpcClient {
//   request(payload: { method: string; params: unknown }): PromiseLike<unknown>;
// }

// export interface EventClient {
//   on(eventName: string, listener: (...args: unknown[]) => void): void;
//   removeListener(eventName: string, listener: (...args: unknown[]) => void): void;
// }

// export interface InjectedCkb<R extends RpcClient = RpcClient, E extends EventClient = EventClient> {
//   readonly version: string;

//   /**
//    * send a JSON-RPC request to the wallet
//    */
//   request: R['request'];

//   /**
//    * subscribe to an event from the wallet
//    *
//    */
//   on: E['on'];

//   /**
//    * unsubscribe to an event from the wallet
//    */
//   removeListener: E['removeListener'];

//   /**
//    * Enable the wallet for a dApp
//    * @deprecated please migrate to {@link InjectedCkb.request}
//    */
//   enable(): Promise<CkbProvider>;

//   /**
//    * Check the wallet is enabled for a dApp
//    * @deprecated please migrate to {@link InjectedCkb.request}
//    */
//   isEnabled(): Promise<boolean>;
// }

/**
 * @deprecated please migrate to {@link InjectedCkb.request}, e.g. `ckb.request({ method: "wallet_fullOwnership_getLiveCell", params: {} })`
 */
export interface CkbProvider {
  getNetworkName(): Promise<Network>;

  fullOwnership: Keyring;
  ruleBasedOwnership: Keyring;
}

export interface Keyring {
  getOffChainLocks(options?: GetUnusedLocksOptions): Promise<Script[]>;
  getOnChainLocks(payload?: { cursor?: string }): Promise<Paginate<Script>>;
  getLiveCells(payload?: { cursor?: string }): Promise<Paginate<Cell>>;
  signTransaction(payload: { tx: Transaction }): Promise<GroupedSignature>;

  /**
   * sign custom message
   */
  signData(payload: SignDataPayload): Promise<Signature>;
}

export interface WalletEventListener {
  on(event: 'networkChanged', cb: (payload: { network: Network }) => void): void;
}

/**
 * @see https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-chaininfo
 */
export type Network = 'ckb' | 'ckb_testnet';

export type GetUnusedLocksOptions = {
  change?: boolean;
};

export type GroupedSignature = [Script, Signature][];
export type Signature = string;

export type SignDataPayload = {
  data: HexString;
  signer: LockLike;
};

export type LockLike = PubkeyHash160 | Script;
type PubkeyHash160 = BytesLike;
