import { z } from 'zod';

export const ZHexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });

/**
 * BytesLike type
 * @description Typescript type system will be regarded as the schema in `HexString | ArrayLike<number> | ArrayBuffer`, for aligning type in `lumos`, but this schema only accept `HexString` in implementation.
 */
export const ZHexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/, { message: 'Invalid hex number' });
export const ZHash = ZHexString;
