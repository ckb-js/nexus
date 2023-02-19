import { DefaultLiveCellCursor, DefaultLockCursor } from '../../../../src/services/ownership/cursor';

describe('Cursor', () => {
  it('should decode and encode lock cursor', () => {
    const cursor = new DefaultLockCursor("m/44'/309'/0'/0", 0);
    expect(cursor.encode()).toEqual('Im0vNDQnLzMwOScvMCcvMDowIg==');
    expect(DefaultLockCursor.fromString('Im0vNDQnLzMwOScvMCcvMDowIg==')).toEqual({
      parentPath: "m/44'/309'/0'/0",
      index: 0,
    });
  });
  it('should decode and encode live cell cursor', () => {
    const cursor = new DefaultLiveCellCursor("m/44'/309'/0'/0", 0, '0x01');
    expect(cursor.encode()).toEqual('Im0vNDQnLzMwOScvMCcvMDowOjB4MDEi');
    expect(DefaultLiveCellCursor.fromString('Im0vNDQnLzMwOScvMCcvMDowOjB4MDEi')).toEqual({
      parentPath: "m/44'/309'/0'/0",
      index: 0,
      indexerCursor: '0x01',
    });
  });
});
