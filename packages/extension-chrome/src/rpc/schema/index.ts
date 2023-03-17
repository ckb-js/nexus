import { z, ZodError, ZodType } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { NexusError } from '../../errors';
import { ZScript, ZTransaction } from './blockchain';
import { ZBytesLike } from './primitives';

export const ZGetPaginateItemsPayload = z.object({
  cursor: z.string().optional(),
});
export const ZFilterPayload = z.object({ change: z.enum(['external', 'internal']).optional() });

export const ZGetOffChainLocksPayload = ZFilterPayload;
export const ZGetLiveCellsPayload = ZGetPaginateItemsPayload;
export const ZGetOnChainLocksPayload = ZGetPaginateItemsPayload.merge(ZFilterPayload);
export const ZSignDataPayload = z.object({ data: ZBytesLike, lock: ZScript });

export const ZSignTransactionPayload = z.object({ tx: ZTransaction });

type ZRpcMethodSchema<T> = z.ZodFunction<z.ZodTuple<[z.ZodType<T, z.ZodTypeDef, T>, z.ZodAny], z.ZodUnknown>, z.ZodAny>;

type ZRpcMethod<T> = z.infer<ZRpcMethodSchema<T>>;

function destructArgumentError(argumentError: ZodError): ZodError {
  return new ZodError(argumentError.errors.map((issue) => ({ ...issue, path: issue.path.slice(1) })));
}

export function bindSchemaValidator<T>(schema: ZRpcMethodSchema<T>, handler: ZRpcMethod<T>): ZRpcMethod<T> {
  const wrapped: ZRpcMethod<T> = async (param, context) => {
    const impl = schema.implement(handler);

    try {
      return await impl(param, context);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const argumentError: ZodError | undefined = (e as any).errors[0]?.argumentsError;
      if (e instanceof ZodError && argumentError) {
        throw NexusError.create({ message: fromZodError(destructArgumentError(argumentError)).toString(), data: e });
      }
      throw e;
    }
  };

  return wrapped;
}

export function createRpcMethodSchema<T>(arg: ZodType<T>): ZRpcMethodSchema<T> {
  return z.function().args(arg, z.any()).returns(z.any());
}
