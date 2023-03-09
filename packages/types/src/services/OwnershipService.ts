import type { Bytes, Paginate } from '../base';
import type { Cell, Script, Transaction } from '@ckb-lumos/lumos';
import type { BytesLike } from '@ckb-lumos/codec';

export interface OwnershipService {
  getLiveCells(payload?: GetPaginateItemsPayload): Promise<Paginate<Cell>>;

  /**
   * get unused locks
   */
  getOffChainLocks(payload: GetOffChainLocksPayload): Promise<Script[]>;

  getOnChainLocks(payload: GetUsedLocksPayload): Promise<Paginate<Script>>;

  /**
   * sign a transaction, only the secp256k1_blake2b lock will be signed
   * @param payload
   */
  signTransaction(payload: SignTransactionPayload): Promise<GroupedSignature>;

  /**
   * sign binary data
   * @param payload
   */
  signData(payload: SignDataPayload): Promise<Signature>;
}

export interface GetPaginateItemsPayload {
  cursor?: string;
}

export interface GetOffChainLocksPayload {
  change?: 'external' | 'internal';
}

export interface GetUsedLocksPayload extends GetOffChainLocksPayload, GetPaginateItemsPayload {}

export interface SignTransactionPayload {
  tx: Transaction;
}

export type SignDataPayload = {
  data: BytesLike;
  lock: Script;
};

export type GroupedSignature = [Script, Signature][];
export type Signature = Bytes;
