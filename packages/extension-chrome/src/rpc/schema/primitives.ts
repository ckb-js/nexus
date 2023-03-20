import { z, ZodType } from 'zod';

export const ZHexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });

/**
 * BytesLike type
 * @description For some serialization reasons, it only accepts hex string
 */
export const ZBytesLike: ZodType<z.infer<typeof ZHexString> | ArrayLike<number> | ArrayBuffer> = ZHexString;
export const ZHexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/, { message: 'Invalid hex number' });
export const ZHash = ZHexString;
