import { BIish, BI } from '@ckb-lumos/bi';
import { minimalCellCapacityCompatible, TransactionSkeletonType } from '@ckb-lumos/helpers';
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

  async getLiveCells(params?: ParamOf<'getLiveCells'>): ReturnOf<'getLiveCells'> {
    return this.ckb.request({ method: 'wallet_fullOwnership_getLiveCells', params });
  }

  async getOffChainLocks(params: ParamOf<'getOffChainLocks'>): ReturnOf<'getOffChainLocks'> {
    return this.ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params });
  }

  async getOnChainLocks(params: ParamOf<'getOnChainLocks'>): ReturnOf<'getOnChainLocks'> {
    return this.ckb.request({ method: 'wallet_fullOwnership_getOnChainLocks', params });
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
    const changeLock = (await this.getOffChainLocks({ change: 'internal' }))[0];

    const changeCell: Cell = {
      cellOutput: {
        capacity: '0x0',
        lock: changeLock,
      },
      data: '0x',
    };
    const minimalChangeCapacity = minimalCellCapacityCompatible(changeCell);
    if (minimalChangeCapacity.gt(config.amount)) {
      errors.throwError('The amount is too small to pay the minimal change cell capacity');
    }

    if (!changeLock) {
      errors.throwError('No change lock script found, it may be a internal bug');
    }

    let remainCapacity = BI.from(config.amount).add(minimalChangeCapacity);
    const inputCells: Cell[] = [];
    for await (const cell of this.collector()) {
      inputCells.push(cell);
      remainCapacity = remainCapacity.sub(BI.from(cell.cellOutput.capacity));
      if (remainCapacity.lte(0)) {
        break;
      }
    }
    if (remainCapacity.gt(0)) {
      errors.throwError('Not enough capacity');
    }

    const totalInputs = inputCells.reduce((sum, cell) => sum.add(BI.from(cell.cellOutput.capacity)), BI.from(0));
    const changeAmount = totalInputs.sub(BI.from(config.amount));

    changeCell.cellOutput.capacity = changeAmount.toHexString();

    txSkeleton = txSkeleton
      .update('inputs', (inputs) => {
        return inputs.push(...inputCells);
      })
      .update('outputs', (outputs) => {
        return outputs.push(changeCell);
      });

    return txSkeleton;
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

  async *collector(): AsyncIterable<Cell> {
    let cursor = '';
    while (true) {
      const page = await this.getLiveCells({ cursor });
      if (page.objects.length === 0) {
        return;
      }
      cursor = page.cursor;
      for (const cell of page.objects) {
        yield cell;
      }
    }
  }

  // TODO need to be implemented
  async signTransaction(txSkeleton: TransactionSkeletonType): Promise<TransactionSkeletonType> {
    console.log(txSkeleton);
    errors.unimplemented();
  }
}
