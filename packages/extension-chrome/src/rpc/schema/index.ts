/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodError, ZodType } from 'zod';
import { RPCMethodHandler, RpcMethods } from '../types';
import { ZBytesLike } from './primitives';
import { ZTransaction, ZScript } from './blockchain';
import { NexusError } from '../../errors';
import { ZGetLiveCellsPayload, ZGetOffChainLocksPayload, ZGetOnChainLocksPayload } from './nexus';

/**
 * create a validate schema for a RPC method
 * @param _field the field name of RpcMethods
 * @param arg zod schema, NOTE: if this type is `never`, it means your `TArg` is not equal to `RpcMethods[TKey]['params']`
 * @returns a zod function schema, which can be used to validate the RPC method invoke
 */
function createRPCMethodSchema<TKey extends keyof RpcMethods, TArg extends RpcMethods[TKey]['params']>(
  _field: TKey,
  arg: RpcMethods[TKey]['params'] extends TArg ? ZodType<TArg> : never,
) {
  return z.function().args(arg, z.any()).returns(z.any());
}

// If we need validate parameter for wallet_enable, we can use this schema
// const wallet_enable = createRPCMethodSchema(z.undefined(), z.void());

const wallet_fullOwnership_signData = createRPCMethodSchema(
  'wallet_fullOwnership_signData',
  z.object({ data: ZBytesLike, lock: ZScript }),
);
const wallet_fullOwnership_signTransaction = createRPCMethodSchema(
  'wallet_fullOwnership_signTransaction',
  z.object({ tx: ZTransaction }),
);

const wallet_fullOwnership_getLiveCells = createRPCMethodSchema(
  'wallet_fullOwnership_getLiveCells',
  ZGetLiveCellsPayload,
);
const wallet_fullOwnership_getOffChainLocks = createRPCMethodSchema(
  'wallet_fullOwnership_getOffChainLocks',
  ZGetOffChainLocksPayload,
);
const wallet_fullOwnership_getOnChainLocks = createRPCMethodSchema(
  'wallet_fullOwnership_getOnChainLocks',
  ZGetOnChainLocksPayload,
);

const walletMethodSchemas = {
  // wallet_enable,
  wallet_fullOwnership_getLiveCells,
  wallet_fullOwnership_getOffChainLocks,
  wallet_fullOwnership_getOnChainLocks,
  wallet_fullOwnership_signData,
  wallet_fullOwnership_signTransaction,
};

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
        // TODO: format human readable error message of zod error
        throw NexusError.create({ message: 'Invalid params', data: e });
      }
      throw e;
    }
  };

  return wrapped;
}

export function getMethodSchema<T extends keyof RpcMethods>(name: T): AnyRpcSchema | undefined {
  return name in walletMethodSchemas ? walletMethodSchemas[name as keyof typeof walletMethodSchemas] : undefined;
}
