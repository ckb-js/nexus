import { z } from 'zod';

const ZArrayLikeNumber = z.custom<ArrayLike<number>>((value) => {
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

export const ZBytesLike = ZArrayLikeNumber.or(ZArrayBuffer).or(z.string());

export const ZHexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });
export const ZHash = ZHexString;
export const ZHexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/);
export const ZPackedSince = ZHexNumber;

export const ZHashType = z.union([z.literal('type'), z.literal('data'), z.literal('data1')]);

export const ZScript = z.object({
  codeHash: ZHash,
  hashType: ZHashType,
  args: ZHexString,
});

const ZOutPoint = z.object({
  txHash: ZHash,
  index: ZHexNumber,
});

export const ZDepType = z.union([z.literal('depGroup'), z.literal('code')]);

export const ZCellDep = z.object({
  outPoint: ZOutPoint,
  depType: ZDepType,
});

export const ZInput = z.object({
  previousOutput: ZOutPoint,
  since: ZPackedSince,
});

export const ZOutput = z.object({
  capacity: ZHexNumber,
  lock: ZScript,
  type: ZScript.optional(),
});
export const ZWitnessArgs = z.object({
  lock: ZHexString.optional(),
  inputType: ZHexString.optional(),
  outputType: ZHexString.optional(),
});

export const ZTransaction = z.object({
  cellDeps: z.array(ZCellDep),
  hash: ZHash.optional(),
  headerDeps: z.array(ZHash),
  inputs: z.array(ZInput),
  outputs: z.array(ZOutput),
  outputsData: z.array(ZHexString),
  version: ZHexNumber,
  witnesses: z.array(ZHexString),
});
