import range from 'lodash.range';
import { Events, FullOwnership, InjectedCkb, RpcMethods } from '@nexus-wallet/protocol';
import { BI, BIish } from '@ckb-lumos/bi';
import { assert, errors } from '@nexus-wallet/utils';
import {
  createTransactionFromSkeleton,
  minimalCellCapacityCompatible,
  parseAddress,
  TransactionSkeletonType,
} from '@ckb-lumos/helpers';
import { Address, blockchain, Cell, CellDep, HexString, Script, Transaction } from '@ckb-lumos/base';
import { bytes, PackParam } from '@ckb-lumos/codec';
import { secp256k1Blake160 } from '@ckb-lumos/common-scripts';
import { Config as LumosConfig, getConfig as getLumosConfig, ScriptConfig } from '@ckb-lumos/config-manager';
import { Uint8ArrayCodec } from '@ckb-lumos/codec/lib/base';

function equalPack<C extends Uint8ArrayCodec>(codec: C, a: PackParam<C>, b: PackParam<C>): boolean {
  return bytes.equal(codec.pack(a), codec.pack(b));
}

// util types for FullOwnership

type Suffix<T extends string, P extends string> = T extends `${P}${infer S}` ? S : never;
type FullOwnershipPrefix = 'wallet_fullOwnership_';
type OwnershipMethodNames = Suffix<keyof FullOwnership, FullOwnershipPrefix>;
type ParamOf<K extends OwnershipMethodNames> = Parameters<FullOwnership[`${FullOwnershipPrefix}${K}`]>[0];
type ReturnOf<K extends OwnershipMethodNames> = ReturnType<FullOwnership[`${FullOwnershipPrefix}${K}`]>;

/** Must be a full format address if it's an address */
export type LockScriptLike = Address | Script;

const SECP256K1_SIGNATURE_SIZE = 65;
const SECP256K1_BLAKE160_WITNESS_PLACEHOLDER = bytes.hexify(
  blockchain.WitnessArgs.pack({
    lock: new Uint8Array(SECP256K1_SIGNATURE_SIZE),
  }),
);

export type PayFeeOptions = {
  /**
   * The fee rate, in Shannons per byte. If not specified, the fee rate will be calculated automatically.
   */
  feeRate?: BIish;

  /**
   * Only in these output indexes, can pay fee
   */
  byOutputIndexes?: number[];

  /**
   * if `true`, the fee can be paid by the other wallet owned cells. if {@link PayFeeOptions#byOutputIndexes} is specified, payers lock have higher priority.
   */
  autoInject: boolean;
};

// TODO: let lumos export `getTransactionSizeByTx` and `calculateFeeCompatible` and `lockToScript`
/* istanbul ignore next */
function getTransactionSizeByTx(tx: Transaction): number {
  const serializedTx = blockchain.Transaction.pack(tx);
  // 4 is serialized offset bytesize
  const size = serializedTx.byteLength + 4;
  return size;
}

/* istanbul ignore next */
function calculateFeeCompatible(size: number, feeRate: BIish): BI {
  const ratio = BI.from(1000);
  const base = BI.from(size).mul(feeRate);
  const fee = base.div(ratio);
  if (fee.mul(ratio).lt(base)) {
    return fee.add(1);
  }
  return BI.from(fee);
}

function sumCapacity(cells: TransactionSkeletonType['inputs' | 'outputs']) {
  return cells.reduce((prev, cur) => prev.add(cur.cellOutput.capacity), BI.from(0));
}

export type FullOwnershipProviderConfig = {
  ckb: InjectedCkb<RpcMethods, Events>;
};

export class FullOwnershipProvider {
  private ckb: InjectedCkb<RpcMethods, Events>;

  constructor(config: FullOwnershipProviderConfig) {
    this.ckb = config.ckb;
  }

  async enable(): Promise<{ nickname: string }> {
    return this.ckb.request({ method: 'wallet_enable' });
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

  /**
   * Inject capacity to the transaction's inputs at least equal to the `amount`,
   * if the collected capacity is over the `amount`, a change cell will be added to the transaction's outputs.
   *
   * only lock-only cell(without data and cell's type script) will be injected
   *
   * @param txSkeleton
   * @param config
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
   */
  async injectCapacity(
    txSkeleton: TransactionSkeletonType,
    config: { amount: BIish },
  ): Promise<TransactionSkeletonType> {
    const changeLock = (await this.getOffChainLocks({ change: 'internal' }))[0];
    if (!changeLock) {
      errors.throwError('No change lock script found, it may be a internal bug');
    }

    const changeCell: Cell = {
      cellOutput: {
        capacity: '0x0',
        lock: changeLock,
      },
      data: '0x',
    };
    const minimalChangeCapacity = minimalCellCapacityCompatible(changeCell);

    let neededCapacity = BI.from(config.amount).add(minimalChangeCapacity);
    const inputCells: Cell[] = txSkeleton.inputs.toArray();
    const injectedCells: Cell[] = [];

    for await (const cell of this.collector()) {
      if (
        inputCells
          .concat(injectedCells)
          .find(
            (item) => !!item.outPoint && cell.outPoint && equalPack(blockchain.OutPoint, item.outPoint, cell.outPoint),
          )
      ) {
        continue;
      }

      // a cell with lock-only will be injected
      if (cell.cellOutput.type || cell.data !== '0x') {
        continue;
      }

      injectedCells.push(cell);
      neededCapacity = neededCapacity.sub(BI.from(cell.cellOutput.capacity));
      if (neededCapacity.lte(0)) {
        break;
      }
    }
    if (neededCapacity.gt(0)) {
      errors.throwError('No cell sufficient to inject');
    }

    const totalInputs = injectedCells.reduce((sum, cell) => sum.add(BI.from(cell.cellOutput.capacity)), BI.from(0));
    const changeAmount = totalInputs.sub(BI.from(config.amount));

    changeCell.cellOutput.capacity = changeAmount.toHexString();

    const cellDep = await this.getSecp256k1Blake160CellDep();

    txSkeleton = txSkeleton
      .update('inputs', (inputs) => {
        return inputs.push(...injectedCells);
      })
      .update('witnesses', (witnesses) => {
        const inputWitnesses = injectedCells.map(() => SECP256K1_BLAKE160_WITNESS_PLACEHOLDER);
        return witnesses.push(...inputWitnesses);
      })
      .update('outputs', (outputs) => {
        return outputs.push(changeCell);
      })
      .update('cellDeps', (cellDeps) => {
        const hasSecp256k1Dep = cellDeps.find((item) =>
          equalPack(blockchain.OutPoint, item.outPoint, cellDep.outPoint),
        );
        if (hasSecp256k1Dep) {
          return cellDeps;
        }
        return cellDeps.push(cellDep);
      });

    return txSkeleton;
  }

  /**
   * Pay the transaction fee using the specified lock
   * **NOT** support DAO unlock transaction yet, please consider using `lumos`'s `payFee`
   * @param txSkeleton The transaction skeleton
   * @param options
   * @param options.byOutputIndexes if provided, The outputs in these indexes will be used to pay fee as much as possible. It is useful when you want to pay fee by other lock scripts.
   * @param options.autoInject if true, wallet owned lock will be used to pay fee. If `byOutputIndexes` can not cover all fee, wallet will inject capacity to pay fee.
   * @param options.feeRate The fee rate, in Shannons per byte. If not specified, the fee rate will be calculated automatically.
   * @example
   * ```ts
   * const provider = new FullOwnershipProvider({ ckb });
   * // auto calculate fee rate and use wallet owned lock to pay fee
   * const txSkeleton = await provider.payFee(txSkeleton, { autoInject: true });
   * // auto inject capacity when `byOutputIndex` can not cover the fee
   * const txSkeleton = await provider.payFee(txSkeleton{ byOutputsIndex: [1, 2], autoInject: true });
   * // return the txSkeleton when `byOutputIndex` can not cover the fee
   * // or throw error when payers can not cover the fee
   * const txSkeleton = await provider.payFee(txSkeleton, { payers: [1, 2], autoInject: false });
   * ```
   */
  async payFee(txSkeleton: TransactionSkeletonType, options: PayFeeOptions): Promise<TransactionSkeletonType> {
    if (options.byOutputIndexes?.length === 0 && !options.autoInject) {
      errors.throwError('no byOutputIndexes is provided, but autoInject is `false`');
    }

    // FIXME detect if it is a DAO unlock transaction first
    const autoInject = !!options.autoInject;
    const feeRate = BI.from(options.feeRate || 1000);
    let currentTransactionSize = getTransactionSizeByTx(createTransactionFromSkeleton(txSkeleton));

    // feeFromTransactionSize -  (sum(inputsCapacity) - sum(outputsCapacity))
    let requireFee = calculateFeeCompatible(currentTransactionSize, feeRate).sub(
      sumCapacity(txSkeleton.get('inputs')).sub(sumCapacity(txSkeleton.get('outputs'))),
    );

    if (requireFee.lte(0)) {
      return txSkeleton;
    }

    // use existed output cell to pay fee
    const byOutputIndexes = options.byOutputIndexes ?? [];
    for (const byOutPutIndex of byOutputIndexes) {
      if (requireFee.lte(0)) {
        break;
      }
      const currentCell = txSkeleton.get('outputs').get(byOutPutIndex);
      if (!currentCell) {
        errors.throwError('`byOutPutIndex` is out of range');
      }
      const cellCapacity = BI.from(currentCell.cellOutput.capacity);
      const minimalCapacity = minimalCellCapacityCompatible(currentCell);

      // How many capacity is needed?
      // cellCapacity - originFee >= minimalCapacity ? originFee : cellCapacity - minimalCapacity
      const affordedFee = cellCapacity.sub(requireFee).gte(minimalCapacity)
        ? requireFee
        : cellCapacity.sub(minimalCapacity);

      requireFee = requireFee.sub(affordedFee);
      txSkeleton = txSkeleton.setIn(
        ['outputs', byOutPutIndex, 'cellOutput', 'capacity'],
        cellCapacity.sub(affordedFee).toHexString(),
      );
    }

    // all byOutputIndexes are used but still remain fee to pay and disable autoInject
    if (requireFee.lte(0)) {
      return txSkeleton;
    } else if (!autoInject) {
      errors.throwError('cells from `byOutputIndexes` sufficient to pay fee');
    }

    try {
      const txSkeletonInjected = await this.injectCapacity(txSkeleton, { amount: requireFee });
      return this.payFee(txSkeletonInjected, {
        autoInject: true,
        byOutputIndexes: range(txSkeleton.outputs.size, txSkeletonInjected.outputs.size),
      });
    } catch {
      throw new Error('No cell sufficient to pay fee in your wallet');
    }
  }

  /**
   * Collect cells from wallet.
   * @returns A async iterator of cells
   *
   * @example
   * ```ts
   * async function getOwnedCells(lock: Script) {
   * const cells = [];
   *  for await(const cell of provider.collector({ lock })) {
   *      cells.push(cell);
   *  }
   *
   * return cells;
   * }
   * ```
   */
  async *collector({ lock }: { lock?: Script } = {}): AsyncIterable<Cell> {
    let cursor = '';
    while (true) {
      // TODO: in current version, the cursor prop is required. But it should be optional.
      const page = await this.getLiveCells({ cursor });
      if (page.objects.length === 0) {
        return;
      }
      cursor = page.cursor;
      for (const cell of page.objects) {
        if (!lock || equalPack(blockchain.Script, lock, cell.cellOutput.lock)) {
          yield cell;
        }
      }
    }
  }

  /**
   * request wallet to sign a transaction skeleton
   * @param txSkeleton The transaction skeleton, you can create it from transaction object via {@link @ckb-lumos/helpers#TransactionSkeleton}
   * @returns The signed transaction skeleton. The signatures are serialized and put into the witnesses field.
   */
  async signTransaction(txSkeleton: TransactionSkeletonType): Promise<TransactionSkeletonType> {
    const lumosConfig = await this.getLumosConfig();
    txSkeleton = secp256k1Blake160.prepareSigningEntries(txSkeleton, { config: lumosConfig });

    const groupedSignature = await this.ckb.request({
      method: 'wallet_fullOwnership_signTransaction',
      params: { tx: createTransactionFromSkeleton(txSkeleton) },
    });

    for (let [lock, signature] of groupedSignature) {
      const witnessIndex = txSkeleton.inputs.findIndex((input) =>
        equalPack(blockchain.Script, input.cellOutput.lock, lock),
      );

      /* istanbul ignore next */
      if (witnessIndex === -1) {
        continue;
      }

      const witnessArgs = blockchain.WitnessArgs.unpack(txSkeleton.witnesses.get(witnessIndex) as HexString);
      let witnesses = txSkeleton.witnesses;
      witnesses = witnesses.set(
        witnessIndex,
        bytes.hexify(blockchain.WitnessArgs.pack({ ...witnessArgs, lock: signature })),
      );
      txSkeleton = txSkeleton.set('witnesses', witnesses);
    }

    txSkeleton = txSkeleton.update('signingEntries', (entries) => entries.clear());

    return txSkeleton;
  }

  private async getSecp256k1Blake160CellDep(): Promise<CellDep> {
    const config = await this.getSecp256k1Blake160Config();
    return { depType: config.DEP_TYPE, outPoint: { txHash: config.TX_HASH, index: config.INDEX } };
  }

  // TODO: wait for wallet provider a API to get genesis block
  private async getSecp256k1Blake160Config(): Promise<ScriptConfig> {
    const config = await this.getLumosConfig();
    const result = config.SCRIPTS.SECP256K1_BLAKE160;
    assert(result, 'Cannot find secp256k1_blake160 config in lumos config');
    return result;
  }

  // TODO: wait for wallet provide a API to get genesis block hash
  private async getLumosConfig(): Promise<LumosConfig> {
    return getLumosConfig();
  }

  private async parseLockScriptLike(lock: LockScriptLike) {
    if (typeof lock === 'object') {
      return lock;
    }

    const config = await this.getLumosConfig();
    return parseAddress(lock, { config });
  }
}
