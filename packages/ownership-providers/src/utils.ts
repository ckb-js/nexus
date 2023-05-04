import { Address, blockchain, Cell, HexString, Script, Transaction } from '@ckb-lumos/base';
import { BI, BIish } from '@ckb-lumos/bi';
import { bytes } from '@ckb-lumos/codec';
import { PackParam, Uint8ArrayCodec } from '@ckb-lumos/codec/lib/base';
import { createTransactionFromSkeleton, TransactionSkeletonType } from '@ckb-lumos/helpers';

export function equalPack<C extends Uint8ArrayCodec>(codec: C, a: PackParam<C>, b: PackParam<C>): boolean {
  return bytes.equal(codec.pack(a), codec.pack(b));
}

export const WITNESS_LOCK_PLACEHOLDER = bytes.hexify(new Uint8Array(65));

export const SECP256K1_BLAKE160_WITNESS_PLACEHOLDER = bytes.hexify(
  blockchain.WitnessArgs.pack({
    lock: WITNESS_LOCK_PLACEHOLDER,
  }),
);

/** Must be a full format address if it's an address */
export type LockScriptLike = Address | Script;

// TODO: let lumos export `getTransactionSizeByTx` and `calculateFeeCompatible` and `lockToScript`
/* istanbul ignore next */
export function getTransactionSizeByTx(tx: Transaction): number {
  const serializedTx = blockchain.Transaction.pack(tx);
  // 4 is serialized offset bytesize
  const size = serializedTx.byteLength + 4;
  return size;
}

/* istanbul ignore next */
export function calculateFeeCompatible(size: number, feeRate: BIish): BI {
  const ratio = BI.from(1000);
  const base = BI.from(size).mul(feeRate);
  const fee = base.div(ratio);
  if (fee.mul(ratio).lt(base)) {
    return fee.add(1);
  }
  return BI.from(fee);
}

export function sumCapacity(cells: TransactionSkeletonType['inputs' | 'outputs']): BI {
  return cells.reduce((prev, cur) => prev.add(cur.cellOutput.capacity), BI.from(0));
}

export function hexifyScript<C extends Uint8ArrayCodec>(value: PackParam<C>): HexString {
  return bytes.hexify(blockchain.Script.pack(value));
}

export function isLockOnlyCell(cell: Cell): boolean {
  return !cell.cellOutput.type && cell.data === '0x';
}

export function isTransactionFeePaid(txSkeleton: TransactionSkeletonType, feeRate: BIish = 1000): boolean {
  // TODO: support DAO
  const txSize = getTransactionSizeByTx(createTransactionFromSkeleton(txSkeleton));
  const expectedFee = calculateFeeCompatible(txSize, feeRate);
  const actualFee = sumCapacity(txSkeleton.get('inputs')).sub(sumCapacity(txSkeleton.get('outputs')));

  return actualFee.gte(expectedFee);
}

export class HashMap<K, V> {
  private internal = new Map<string, V>();

  constructor(public readonly hasher: (k: K) => string, values: [K, V][] = []) {
    this.internal = new Map(values.map(([k, v]) => [hasher(k), v] as [string, V]));
  }

  public get(key: K): V | undefined {
    return this.internal.get(this.hasher(key));
  }

  set(key: K, value: V): void {
    this.internal.set(this.hasher(key), value);
  }

  has(key: K): boolean {
    return this.internal.has(this.hasher(key));
  }

  delete(key: K): boolean {
    return this.internal.delete(this.hasher(key));
  }

  get size(): number {
    return this.internal.size;
  }
}

export class ScriptSerializedMap<V> extends HashMap<Script, V> {
  constructor(values: [Script, V][] = []) {
    super(hexifyScript, values);
  }
}

export class HashSet<V> {
  private internal = new Set<string>();
  constructor(public readonly hasher: (v: V) => string, values: V[] = []) {
    this.internal = new Set(values.map(hasher));
  }

  add(value: V): void {
    this.internal.add(this.hasher(value));
  }

  has(value: V): boolean {
    return this.internal.has(this.hasher(value));
  }

  delete(value: V): boolean {
    return this.internal.delete(this.hasher(value));
  }

  get size(): number {
    return this.internal.size;
  }
}

export class ScriptSerializedSet extends HashSet<Script> {
  constructor(values: Script[] = []) {
    super(hexifyScript, values);
  }
}
