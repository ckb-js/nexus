import type { BytesLike } from '@ckb-lumos/codec';
import type { Cell, Script, Transaction } from '@ckb-lumos/lumos';
import type { Bytes, Paginate } from '../base';

export interface OwnershipService {
  getLiveCells(payload?: GetPaginateItemsPayload): Promise<Paginate<Cell>>;

  /**
   * get unused locks
   */
  getOffChainLocks(payload: getOffChainLocksPayload): Promise<Script[]>;

  getOnChainLocks(payload: getOnChainLocksPayload): Promise<Paginate<Script>>;

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

export interface getOffChainLocksPayload {
  change?: boolean;
}

export interface getOnChainLocksPayload extends getOffChainLocksPayload, GetPaginateItemsPayload {}

export interface SignTransactionPayload {
  tx: Transaction;
}

export type SignDataPayload = {
  data: BytesLike;
  lock: Script;
};

export type GroupedSignature = [Script, Signature][];
export type Signature = Bytes;
