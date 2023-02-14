import { CircularOffChainLockInfo } from '../../src/services/backend/circular';
import { LockInfo } from '../../src/services/backend/types';

const generateLockInfo = (index = 0): LockInfo => ({
  parentPath: `m/44'/309'/0'/0/${index}`,
  index: 0,
  lock: {
    codeHash: '0x',
    hashType: 'type',
    args: '0x',
  },
  blake160: '0x',
  publicKey: `0x`,
  lockHash: '0x',
  network: 'ckb_testnet' as const,
  onchain: false,
});

describe('CircularOffChainLockInfo', () => {
  it('should return empty lock when items is empty', () => {
    const lockProvider = new CircularOffChainLockInfo({
      items: [],
      pointer: null,
      storageUpdator: () => Promise.resolve(),
      pointerUpdator: () => Promise.resolve(),
    });
    expect(lockProvider.current()).toEqual(undefined);
    expect(lockProvider.next()).toEqual(undefined);
    expect(() => lockProvider.takeAndSupply(1, generateLockInfo())).toThrow();
  });
  it('should return fisrt lock when items is not empty and pointer is empty', () => {
    const lockProvider = new CircularOffChainLockInfo({
      items: [generateLockInfo()],
      pointer: null,
      storageUpdator: () => Promise.resolve(),
      pointerUpdator: () => Promise.resolve(),
    });
    expect(lockProvider.current()).toEqual(undefined);
    expect(lockProvider.next()).toEqual(generateLockInfo());
    expect(lockProvider.takeAndSupply(0, generateLockInfo())).toEqual(generateLockInfo());
  });
  it('should return circular lock when items is not empty and pointer is first lock', () => {
    const lockProvider = new CircularOffChainLockInfo({
      items: [generateLockInfo(0), generateLockInfo(1)],
      pointer: generateLockInfo(0),
      storageUpdator: () => Promise.resolve(),
      pointerUpdator: () => Promise.resolve(),
    });
    expect(lockProvider.current()).toEqual(generateLockInfo(0));
    expect(lockProvider.next()).toEqual(generateLockInfo(1));
    expect(lockProvider.next()).toEqual(generateLockInfo(0));
    expect(lockProvider.next()).toEqual(generateLockInfo(1));
  });
});
