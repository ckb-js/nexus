import { z, ZodType } from 'zod';
import { ZOutputsValidator, ZScript, ZTransaction } from './blockchain';
import { RpcMethods } from '@nexus-wallet/types';
import { ZHexString } from './primitives';

type ObjectEquals<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
export type ExactValidator<A extends ZodType, E> = ObjectEquals<z.infer<A>, E> extends true ? ZodType<E> : never;

function createExactValidator<T>(schema: ZodType<T>): ExactValidator<ZodType<T>, T> {
  return schema as ExactValidator<ZodType<T>, T>;
}
// TODO @IronLu233 please refactor it to use `ExactValidator` instead of `ZodType`

export const ZGetPaginateItemsPayload = z.object({
  cursor: z.string().optional(),
});
export const ZFilterPayload = z.object({ change: z.enum(['external', 'internal']).optional() });

export const ZGetOffChainLocksPayload = ZFilterPayload;
export const ZGetLiveCellsPayload = createExactValidator<
  Parameters<RpcMethods['wallet_fullOwnership_getLiveCells']>[0]
>(ZGetPaginateItemsPayload.merge(ZFilterPayload));
export const ZGetOnChainLocksPayload = ZGetPaginateItemsPayload.merge(ZFilterPayload);
export const ZSignDataPayload = z.object({ data: ZHexString, lock: ZScript });

export const ZSignTransactionPayload = z.object({ tx: ZTransaction });

export const ZSendTransactionPayload = z.object({ tx: ZTransaction, outputsValidator: z.optional(ZOutputsValidator) });
