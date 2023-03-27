import { z } from 'zod';

/**
 * @see {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#type-jsonbytes JsonBytes}
 */
export const ZHexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });

export const ZHexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/, { message: 'Invalid hex number' });
export const ZHash = ZHexString;
