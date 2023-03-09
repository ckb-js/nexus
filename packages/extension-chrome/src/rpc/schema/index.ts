import { z } from 'zod';
import { RpcMethods } from '../types';
import { Transaction, HexString } from './primitives';

function createRPCMethodSchema<TArg extends z.AnyZodObject, TReturn extends z.ZodTypeAny>(arg: TArg, returns: TReturn) {
  return z.function().args(arg, z.any()).returns(returns);
}

const wallet_enable = createRPCMethodSchema(z.object({}), z.void());

const wallet_fullOwnership_signData = createRPCMethodSchema(z.object({ data: HexString }), z.string());
const wallet_fullOwnership_signTransaction = createRPCMethodSchema(z.object({ transaction: Transaction }), z.string());

const walletMethodSchemas = {
  wallet_enable,
  wallet_fullOwnership_signData,
  wallet_fullOwnership_signTransaction,
};

export function getMethodSchema<T extends keyof RpcMethods>(
  name: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny> | undefined {
  return name in walletMethodSchemas ? walletMethodSchemas[name as keyof typeof walletMethodSchemas] : undefined;
}
