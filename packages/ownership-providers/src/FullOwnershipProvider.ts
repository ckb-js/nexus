import { BIish } from '@ckb-lumos/bi';
import { TransactionSkeletonType } from '@ckb-lumos/helpers';
import { Events, FullOwnership, InjectedCkb } from '@nexus-wallet/protocol';
import { errors } from '@nexus-wallet/utils';
import { Address, Cell, Script } from '@ckb-lumos/base';

// util types for FullOwnership

type Suffix<T extends string, P extends string> = T extends `${P}${infer S}` ? S : never;
type FullOwnershipPrefix = 'wallet_fullOwnership_';
type OwnershipMethodNames = Suffix<keyof FullOwnership, FullOwnershipPrefix>;
type ParamOf<K extends OwnershipMethodNames> = Parameters<FullOwnership[`${FullOwnershipPrefix}${K}`]>[0];
type ReturnOf<K extends OwnershipMethodNames> = ReturnType<FullOwnership[`${FullOwnershipPrefix}${K}`]>;

/** Must be a full format address if it's an address */
export type LockScriptLike = Address | Script;

export type PayFeeOptions = {
  /**
   * The fee rate, in shannons per byte. If not specified, the fee rate will be calculated automatically.
   */
  feeRate?: BIish;
} & PayBy;
export type PayBy = PayByPayers | PayByAuto;
/** Pay by the specified payers */
export type PayByPayers = { payers: LockScriptLike[]; autoInject?: boolean };
/** Pay by inject automatically */
export type PayByAuto = { autoInject: true };

export class FullOwnershipProvider {
  private ckb: InjectedCkb<FullOwnership, Events>;

  constructor(config: { ckb: InjectedCkb<FullOwnership, Events> }) {
    this.ckb = config.ckb;
  }

  async getLiveCells(params: ParamOf<'getLiveCells'>): ReturnOf<'getLiveCells'> {
    return this.ckb.request({ method: 'wallet_fullOwnership_getLiveCells', params });
  }

  // TODO bind other methods, getOffChainLocks, getOnChainLocks, etc.

  // TODO need to be implemented
  /**
   * Inject capacity to the transaction's inputs at least equal to the `amount`,
   * if the collected capacity is over the `amount`, a change cell will be added to the transaction's outputs.
   * @example
   *   // Transfer 100 CKB to the target lock script
   *   declare let txSkeleton: TransactionSkeletonType;
   *   declare const target: Script;
   *   declare const provider: FullOwnershipProvider;
   *   const capacity = '10000000000'; // 100 CKB
   *   txSkeleton = txSkeleton.update('outputs', (outputs) =>
   *     outputs.push({ cellOutput: { capacity: capacity, lock: target }, data: '0x' }),
   *   );
   *
   *   txSkeleton = await provider.injectCapacity(txSkeleton, { amount: capacity });
   *
   * @param txSkeleton
   * @param config
   */
  async injectCapacity(
    txSkeleton: TransactionSkeletonType,
    config: {
      /** Inject at least this amount of capacity */
      amount: BIish;
    },
  ): Promise<TransactionSkeletonType> {
    console.log(txSkeleton, config);
    errors.unimplemented();
  }

  // TODO need to be implemented

  /**
   * Pay the transaction fee
   * @param txSkeleton
   * @param options
   */
  async payFee(txSkeleton: TransactionSkeletonType, options?: PayFeeOptions): Promise<TransactionSkeletonType> {
    console.log(txSkeleton, options);
    errors.unimplemented();
  }

  collector(): AsyncIterable<Cell> {
    errors.unimplemented();
  }

  // TODO need to be implemented
  async signTransaction(txSkeleton: TransactionSkeletonType): Promise<TransactionSkeletonType> {
    console.log(txSkeleton);
    errors.unimplemented();
  }
}
