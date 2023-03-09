import { z } from 'zod';

export const HexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])+$/);
export const Hash = HexString;
export const HexNumber = HexString;
export const PackedSince = HexString;

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
  capacity: HexString,
  lock: Script,
  type: Script.optional(),
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
    type: Script.optional(),
  }),
  data: HexString,
  outPoint: OutPoint.optional(),
  blockHash: Hash.optional(),
  blockNumber: HexNumber.optional(),
});
