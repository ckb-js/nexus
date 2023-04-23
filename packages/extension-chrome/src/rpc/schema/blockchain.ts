import {
  CellDep,
  DepType,
  HashType,
  Input,
  OutPoint,
  Output,
  PackedSince,
  Script,
  Transaction,
  WitnessArgs,
} from '@ckb-lumos/lumos';
import { z, ZodType } from 'zod';
import { ZHexString, ZHexNumber, ZHash } from './primitives';

export const ZPackedSince: ZodType<PackedSince> = ZHexNumber;
export const ZHashType: ZodType<HashType> = z.enum(['type', 'data', 'data1']);

export const ZScript: ZodType<Script> = z.object({
  codeHash: ZHash,
  hashType: ZHashType,
  args: ZHexString,
});

const ZOutPoint: ZodType<OutPoint> = z.object({
  txHash: ZHash,
  index: ZHexNumber,
});

export const ZDepType: ZodType<DepType> = z.enum(['depGroup', 'code']);

export const ZCellDep: ZodType<CellDep> = z.object({
  outPoint: ZOutPoint,
  depType: ZDepType,
});

export const ZInput: ZodType<Input> = z.object({
  previousOutput: ZOutPoint,
  since: ZPackedSince,
});

export const ZOutput: ZodType<Output> = z.object({
  capacity: ZHexNumber,
  lock: ZScript,
  type: ZScript.optional(),
});
export const ZWitnessArgs: ZodType<WitnessArgs> = z.object({
  lock: ZHexString.optional(),
  inputType: ZHexString.optional(),
  outputType: ZHexString.optional(),
});

export const ZTransaction: ZodType<Transaction> = z.object({
  cellDeps: z.array(ZCellDep),
  hash: ZHash.optional(),
  headerDeps: z.array(ZHash),
  inputs: z.array(ZInput),
  outputs: z.array(ZOutput),
  outputsData: z.array(ZHexString),
  version: ZHexNumber,
  witnesses: z.array(ZHexString),
});

export const ZOutputsValidator = z.enum(['passthrough', 'well_known_scripts_only']);
