import { CellCursor, decodeCursor, encodeCursor } from '../../../src/services/ownership/cursor';
describe('cursor', () => {
  it('should encode and decode cursor', () => {
    const cursor: CellCursor = {
      localId: 1,
      indexerCursor: '0x1234',
    };
    const encoded = encodeCursor(cursor);
    expect(encoded).toEqual('1:0x1234');
    expect(decodeCursor(encoded)).toEqual(cursor);
  });
});
