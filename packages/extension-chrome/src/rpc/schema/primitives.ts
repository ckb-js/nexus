import { z } from 'zod';

const ArrayLikeNumber = z.custom<ArrayLike<number>>((value) => {
  return (
    typeof typeof value === 'object' &&
    value !== null &&
    value !== undefined &&
    'length' in (value as ArrayLike<number>) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as ArrayLike<number>)[Symbol.iterator as any] === 'function'
  );
});

const ZArrayBuffer = z.custom<ArrayBuffer>((value) => value instanceof ArrayBuffer);

export const BytesLike = ArrayLikeNumber.or(ZArrayBuffer).or(z.string());

export const HexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });
export const Hash = HexString;
export const HexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/);
export const PackedSince = HexNumber;

export const HashType = z.union([z.literal('type'), z.literal('data'), z.literal('data1')]);

export const Script = z.object({
  codeHash: Hash,
  hashType: HashType,
  args: HexString,
});

const OutPoint = z.object({
  txHash: Hash,
  index: HexNumber,
});

export const DepType = z.union([z.literal('depGroup'), z.literal('code')]);

export const CellDep = z.object({
  outPoint: OutPoint,
  depType: DepType,
});

export const Input = z.object({
  previousOutput: OutPoint,
  since: PackedSince,
});

export const Output = z.object({
  capacity: HexNumber,
  lock: Script,
  type: Script.nullish(),
});
export const WitnessArgs = z.object({
  lock: HexString.optional(),
  inputType: HexString.optional(),
  outputType: HexString.optional(),
});

export const Transaction = z.object({
  cellDeps: z.array(CellDep),
  hash: Hash.optional(),
  headerDeps: z.array(Hash),
  inputs: z.array(Input),
  outputs: z.array(Output),
  outputsData: z.array(HexString),
  version: HexNumber,
  witnesses: z.array(HexString),
});

export const Cell = z.object({
  cellOutput: z.object({
    capacity: HexNumber,
    lock: Script,
    type: Script.nullish(),
  }),
  data: HexString,
  outPoint: OutPoint.nullish(),
  blockHash: Hash.optional(),
  blockNumber: HexNumber.optional(),
});
