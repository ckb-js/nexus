import { DefaultLockCursor } from '../../../../src/services/ownership/cursor';
import { DefaultOnChainLockProvider } from '../../../../src/services/ownership/onchainLockProvider';
import { LockInfo } from '../../../../src/services/ownership/types';

const generateLockInfo = (index = 0, change = 0): LockInfo => ({
  parentPath: `m/44'/309'/0'/${change}`,
  index,
  lock: {
    codeHash: '0x',
    hashType: 'type',
    args: '0x',
  },
  blake160: '0x',
  publicKey: `0x`,
  lockHash: '0x',
  onchain: true,
});

describe('onChainLockProvider', () => {
  it('should getNextLock return undefined if items in storage is empty', () => {
    const provider = new DefaultOnChainLockProvider({ items: [] });
    expect(provider.getNextLock({})).toEqual(undefined);
  });
  it('should getNextLock return 1 lock if items in storage has one', () => {
    const lock = generateLockInfo();
    const provider = new DefaultOnChainLockProvider({ items: [lock] });
    expect(provider.getNextLock({})).toEqual({
      cursor: {
        index: 0,
        parentPath: "m/44'/309'/0'/0",
      },
      lockInfo: lock,
    });
  });
  it('should getNextLock return nothing if filter "change" is "internal"', () => {
    const lock = generateLockInfo();
    const provider = new DefaultOnChainLockProvider({ items: [lock] });
    expect(provider.getNextLock({ filter: { change: 'internal' } })).toEqual(undefined);
    expect(provider.getNextLock({ filter: { change: 'external' } })).toEqual({
      cursor: {
        index: 0,
        parentPath: "m/44'/309'/0'/0",
      },
      lockInfo: lock,
    });
  });
  it('should getNextLock return lock next to the cursor', () => {
    const lock1 = generateLockInfo();
    const lock2 = generateLockInfo(1);
    const lock3 = generateLockInfo(2);
    const provider = new DefaultOnChainLockProvider({ items: [lock1, lock2, lock3] });
    expect(provider.getNextLock({ cursor: new DefaultLockCursor("m/44'/309'/0'/0", 0) })).toEqual({
      cursor: {
        index: 1,
        parentPath: "m/44'/309'/0'/0",
      },
      lockInfo: lock2,
    });
  });
});
