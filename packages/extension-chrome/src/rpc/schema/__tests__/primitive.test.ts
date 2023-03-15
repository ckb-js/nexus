import { ZodType } from 'zod';
import { ZBytesLike, ZHash, ZHexNumber, ZHexString } from '../primitives';

describe('primitive type', () => {
  function expectParseSuccess<T>(schema: ZodType<T>, value: unknown) {
    expect(schema.parse(value)).toEqual(value);
  }

  function expectParseFailure<T>(schema: ZodType<T>, value: unknown) {
    expect(() => schema.parse(value)).toThrow();
  }

  it('BytesLike', () => {
    // arraylike buffer
    expectParseSuccess(ZBytesLike, 'aabbccc');
    expectParseSuccess(ZBytesLike, new Uint8Array([1, 2, 3]));
    expectParseSuccess(ZBytesLike, new Uint8Array([1, 2, 3]).buffer);

    expectParseFailure(ZBytesLike, 1);
  });

  it('HexString', () => {
    for (const schema of [ZHexString, ZHash]) {
      expectParseSuccess(schema, '0x');
      expectParseSuccess(schema, '0x1ea34c7b6735689a9661f1a43ece11a866e47718817d38e0c5b92e5a973df739');

      expectParseFailure(schema, '0x233');
      expectParseFailure(schema, '');
      expectParseFailure(schema, 2);
    }
  });

  it('HexNumber', () => {
    expectParseSuccess(ZHexNumber, '0x0');
    expectParseSuccess(ZHexNumber, '0x64');
    expectParseFailure(ZHexNumber, '0x');
  });
});
