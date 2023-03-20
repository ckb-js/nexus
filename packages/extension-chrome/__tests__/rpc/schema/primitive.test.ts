import { ZBytesLike, ZHash, ZHexNumber, ZHexString } from '../../../src/rpc/schema/primitives';

describe('primitive type', () => {
  it('BytesLike', () => {
    // array like buffer
    expect(ZBytesLike.parse('aabbcc')).toBe('aabbcc');
    expect(ZBytesLike.parse(new Uint8Array([1, 2, 3]))).toEqual(new Uint8Array([1, 2, 3]));
    expect(ZBytesLike.parse(new Uint8Array([1, 2, 3]).buffer)).toEqual(new Uint8Array([1, 2, 3]).buffer);

    expect(() => ZBytesLike.parse(1)).toThrow('Expected string, received number');
  });

  it('HexString', () => {
    for (const schema of [ZHexString, ZHash]) {
      expect(schema.parse('0x')).toBe('0x');
      expect(schema.parse('0x1ea34c7b6735689a9661f1a43ece11a866e47718817d38e0c5b92e5a973df739')).toBe(
        '0x1ea34c7b6735689a9661f1a43ece11a866e47718817d38e0c5b92e5a973df739',
      );

      expect(() => schema.parse('0x233')).toThrow('Invalid hex string');
      expect(() => schema.parse('')).toThrow('Invalid hex string');
      expect(() => schema.parse(2)).toThrow('Expected string, received number');
    }
  });

  it('HexNumber', () => {
    expect(ZHexNumber.parse('0x0')).toBe('0x0');
    expect(ZHexNumber.parse('0x64')).toBe('0x64');
    expect(() => ZHexNumber.parse('0x')).toThrow('Invalid hex number');
  });
});
