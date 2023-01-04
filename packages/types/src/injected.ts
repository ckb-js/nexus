import { Cell, Script, Transaction } from '@ckb-lumos/lumos';
import { BytesLike } from '@ckb-lumos/codec';
import { Paginate } from './base';

export interface InjectedCkb {
  readonly version: string;

  /**
   * Enable the wallet for a dApp
   */
  enable(): Promise<CkbProvider>;

  /**
   * Check the wallet is enabled for a dApp
   */
  isEnabled(): Promise<boolean>;
}

export interface CkbProvider {
  getNetworkName(): Promise<Network>;

  fullOwnership: Keyring;
  ruleBasedOwnership: Keyring;
}

export interface Keyring {
  getUnusedLocks(options?: GetUnusedLocksOptions): Promise<Script[]>;
  getUsedLocks(payload?: { cursor?: string }): Promise<Paginate<Script>>;
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
  data: BytesLike;
  signer: LockLike;
};

export type LockLike = PubkeyHash160 | Script;
type PubkeyHash160 = BytesLike;
