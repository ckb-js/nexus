import { z } from 'zod';
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
