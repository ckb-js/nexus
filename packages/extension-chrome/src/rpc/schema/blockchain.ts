import { z } from 'zod';
import { ZHexString, ZHexNumber, ZHash } from './primitives';

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
