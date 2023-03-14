import type { Bytes, Paginate, RequesterInfo } from '../base';
import type { Cell, Script, Transaction } from '@ckb-lumos/lumos';
import type { BytesLike } from '@ckb-lumos/codec';

export interface OwnershipService {
  getLiveCells(payload?: GetLiveCellsPayload): Promise<Paginate<Cell>>;

  /**
   * get unused locks
   */
  getOffChainLocks(payload: GetOffChainLocksPayload): Promise<Script[]>;

  getOnChainLocks(payload: GetOnChainLocksPayload): Promise<Paginate<Script>>;

  /**
   * sign a transaction, only the secp256k1_blake2b lock will be signed
   * @param payload
   */
  signTransaction(payload: SignTransactionPayload & RequesterInfo): Promise<GroupedSignature>;

  /**
   * sign binary data
   * @param payload
   */
  signData(payload: SignDataPayload & RequesterInfo): Promise<Signature>;
}

export interface GetPaginateItemsPayload {
  cursor?: string;
}

export interface FilterPayload {
  change?: 'external' | 'internal';
}

export interface GetOffChainLocksPayload extends FilterPayload {}
export interface GetLiveCellsPayload extends GetPaginateItemsPayload {}
export interface GetOnChainLocksPayload extends GetPaginateItemsPayload, FilterPayload {}

export interface SignTransactionPayload {
  tx: Transaction;
}

export type SignDataPayload = {
  data: BytesLike;
  lock: Script;
};

export type GroupedSignature = [Script, Signature][];
export type Signature = Bytes;
