import { z } from 'zod';

export const HexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });
export const Hash = HexString;
export const HexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/);
export const PackedSince = HexNumber;

export const HashType = z.union([z.literal('type'), z.literal('data'), z.literal('data1')]);

const Script = z.object({
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
  type: Script.optional().nullable(),
});

export const WitnessArgs = z.object({
  lock: HexString.optional().nullable(),
  inputType: HexString.optional().nullable(),
  outputType: HexString.optional().nullable(),
});

export const Transaction = z.object({
  cellDeps: z.array(CellDep),
  hash: Hash.optional().nullable(),
  headerDeps: z.array(Hash),
  inputs: z.array(Input),
  outputs: z.array(Output),
  // outputsData: z.array(HexString),
  outputsData: z.any(),
  // version: HexNumber,
  version: z.any(),
  // witnesses: z.array(HexString),
  witnesses: z.any(),
});

export const Cell = z.object({
  cellOutput: z.object({
    capacity: HexNumber,
    lock: Script,
    type: Script.optional().nullable(),
  }),
  data: HexString,
  outPoint: OutPoint.optional().nullable(),
  blockHash: Hash.optional().nullable(),
  blockNumber: HexNumber.optional().nullable(),
});
