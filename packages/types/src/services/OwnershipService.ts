import type { RequesterInfo } from '../base';
import type { Cell, Script } from '@ckb-lumos/lumos';
import type { BytesLike } from '@ckb-lumos/codec';
import { FullOwnership, GroupedSignature, Paginate, Signature } from '@nexus-wallet/protocol';
import { OmitPrefix } from '../helpers';

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
  signTransaction(payload: SignTransactionPayload): Promise<GroupedSignature>;

  /**
   * sign binary data
   * @param payload
   */
  signData(payload: SignDataPayload): Promise<Signature>;
}

type OwnershipMethods = OmitPrefix<FullOwnership, 'wallet_fullOwnership_'>;
type ParamOf<K extends keyof OwnershipMethods> = Parameters<OwnershipMethods[K]>[0];

export type GetOffChainLocksPayload = ParamOf<'getOffChainLocks'>;
export type GetLiveCellsPayload = ParamOf<'getLiveCells'>;
export type GetOnChainLocksPayload = ParamOf<'getOnChainLocks'>;
export type SignTransactionPayload = ParamOf<'signTransaction'> & RequesterInfo;
export type SignDataPayload = { data: BytesLike; lock: Script } & RequesterInfo;
