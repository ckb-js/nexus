import { errors } from '@nexus-wallet/utils/lib';
import { z, ZodError } from 'zod';
import { RPCMethodHandler, RpcMethods } from '../types';
import { Transaction, HexString, Script } from './primitives';

function createRPCMethodSchema<TArg extends z.AnyZodObject | z.ZodUndefined, TReturn extends z.ZodTypeAny>(
  arg: TArg,
  returns: TReturn,
) {
  return z.function().args(arg, z.any()).returns(z.promise(returns));
}

const getPaginateItemsPayload = z.object({
  cursor: z.string().optional(),
});

const getOffChainLocksPayload = z.object({ change: z.enum(['external', 'internal']) });
const getUsedLocksPayload = getOffChainLocksPayload.merge(getPaginateItemsPayload);

// const wallet_enable = createRPCMethodSchema(z.undefined(), z.void());

const wallet_fullOwnership_signData = createRPCMethodSchema(z.object({ data: HexString, lock: Script }), z.string());
const wallet_fullOwnership_signTransaction = createRPCMethodSchema(z.object({ tx: Transaction }), z.string());

const wallet_fullOwnership_getLiveCells = createRPCMethodSchema(getPaginateItemsPayload, z.any());
const wallet_fullOwnership_getOffChainLocks = createRPCMethodSchema(getOffChainLocksPayload, z.any());

const wallet_fullOwnership_getOnChainLocks = createRPCMethodSchema(getUsedLocksPayload, z.any());

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
        errors.throwError('Invalid params');
      }
      throw e;
    }
  };

  return wrapped;
}

export function getMethodSchema<T extends keyof RpcMethods>(name: T): AnyRpcSchema | undefined {
  return name in walletMethodSchemas ? walletMethodSchemas[name as keyof typeof walletMethodSchemas] : undefined;
}
