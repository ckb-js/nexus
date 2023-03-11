/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GetOffChainLocksPayload,
  GetPaginateItemsPayload,
  GetUsedLocksPayload,
  SignDataPayload,
  // SignTransactionPayload,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { errors } from '@nexus-wallet/utils/lib';
import { z, ZodError } from 'zod';
import { RPCMethodHandler, RpcMethods } from '../types';
import { Transaction, Script, BytesLike } from './primitives';

function createRPCMethodSchema<TArg extends z.AnyZodObject | z.ZodUndefined>(arg: TArg) {
  return z.function().args(arg, z.any()).returns(z.promise(z.any()));
}

const getPaginateItemsPayload = z.object({
  cursor: z.string().optional(),
});

const getOffChainLocksPayload = z.object({ change: z.enum(['external', 'internal']).optional() });
const getUsedLocksPayload = getOffChainLocksPayload.merge(getPaginateItemsPayload);

// If we need validate parameter for wallet_enable, we can use this schema
// const wallet_enable = createRPCMethodSchema(z.undefined(), z.void());

const wallet_fullOwnership_signData = createRPCMethodSchema(z.object({ data: BytesLike, lock: Script }));
const wallet_fullOwnership_signTransaction = createRPCMethodSchema(z.object({ tx: Transaction }));

const wallet_fullOwnership_getLiveCells = createRPCMethodSchema(getPaginateItemsPayload);
const wallet_fullOwnership_getOffChainLocks = createRPCMethodSchema(getOffChainLocksPayload);
const wallet_fullOwnership_getOnChainLocks = createRPCMethodSchema(getUsedLocksPayload);

const walletMethodSchemas = {
  // wallet_enable,
  wallet_fullOwnership_getLiveCells,
  wallet_fullOwnership_getOffChainLocks,
  wallet_fullOwnership_getOnChainLocks,
  wallet_fullOwnership_signData,
  wallet_fullOwnership_signTransaction,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRpcSchema = z.ZodFunction<z.ZodTuple<any, any>, z.ZodTypeAny>;

export function bindSchemaValidator<T extends keyof RpcMethods>(
  method: T,
  handler: RPCMethodHandler<T>,
): RPCMethodHandler<T> {
  const schema = walletMethodSchemas[method as keyof typeof walletMethodSchemas] as AnyRpcSchema | undefined;
  if (!schema) return handler;

  const wrapped: RPCMethodHandler<T> = async (param, context) => {
    const impl = schema.implement(handler);

    try {
      return await impl(param, context);
    } catch (e) {
      if (e instanceof ZodError) {
        errors.throwError('Invalid params', e.message);
      }
      throw e;
    }
  };

  return wrapped;
}

export function getMethodSchema<T extends keyof RpcMethods>(name: T): AnyRpcSchema | undefined {
  return name in walletMethodSchemas ? walletMethodSchemas[name as keyof typeof walletMethodSchemas] : undefined;
}

// Static type validation for keeping type safety
type Expect<T extends true> = T;
type ParameterEqual<X extends Record<any, any>, Y extends Record<any, any>> = X extends Y
  ? Y extends X
    ? true
    : false
  : false;

type SchemaFirstParameter<S extends AnyRpcSchema> = Parameters<z.infer<S>>[0];

type ValidatePayload<S extends AnyRpcSchema, P extends Record<any, any>> = ParameterEqual<SchemaFirstParameter<S>, P>;
type _cases = [
  Expect<ValidatePayload<typeof wallet_fullOwnership_getLiveCells, GetPaginateItemsPayload>>,
  Expect<ValidatePayload<typeof wallet_fullOwnership_getOffChainLocks, GetOffChainLocksPayload>>,
  Expect<ValidatePayload<typeof wallet_fullOwnership_getOnChainLocks, GetUsedLocksPayload>>,
  Expect<ValidatePayload<typeof wallet_fullOwnership_signData, SignDataPayload>>,

  // FIXME, for some reason, it is not equal
  // Expect<ValidatePayload<typeof wallet_fullOwnership_signTransaction, SignTransactionPayload>>
];
