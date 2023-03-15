import { z } from 'zod';

const ZArrayLikeNumber = z.custom<ArrayLike<number>>((value) => {
  return (
    typeof value === 'object' &&
    value !== null &&
    value !== undefined &&
    'length' in (value as ArrayLike<number>) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as ArrayLike<number>)[Symbol.iterator as any] === 'function'
  );
});

const ZArrayBuffer = z.custom<ArrayBuffer>((value) => value instanceof ArrayBuffer);
export const ZBytesLike = ZArrayLikeNumber.or(ZArrayBuffer).or(z.string());
export const ZHexString = z.string().regex(/^0x([0-9a-fA-F][0-9a-fA-F])*$/, { message: 'Invalid hex string' });
export const ZHexNumber = z.string().regex(/^0x([0-9a-fA-F])+$/);
export const ZHash = ZHexString;
