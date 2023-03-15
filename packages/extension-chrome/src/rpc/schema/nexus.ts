import { z } from 'zod';

export const ZGetPaginateItemsPayload = z.object({
  cursor: z.string().optional(),
});
export const ZFilterPayload = z.object({ change: z.enum(['external', 'internal']).optional() });

export const ZGetOffChainLocksPayload = ZFilterPayload;
export const ZGetLiveCellsPayload = ZGetPaginateItemsPayload;
export const ZGetOnChainLocksPayload = ZGetPaginateItemsPayload.merge(ZFilterPayload);
