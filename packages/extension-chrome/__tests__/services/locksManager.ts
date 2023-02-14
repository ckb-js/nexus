import {
  generateLocksAndPointers,
  mockFullOwnershipLockInfosChange,
  mockFullOwnershipLockInfosExternal,
  mockRuleBasedOwnershipLockInfos,
} from './utils';
import { getDefaultLocksAndPointer } from '../../src/services/backend/utils';
import { LocksManager } from '../../src/services/backend/locksManager';
import { LockInfoStorage, LockInfo } from '../../src/services/backend/types';
import { Storage } from '@nexus-wallet/types';

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
  network: 'ckb_testnet' as const,
  onchain: false,
});

describe('locksManager', () => {
  it('should return default value when lockDetails are empty', async () => {
    const memoryStorage: LockInfoStorage = {
      fullOwnership: getDefaultLocksAndPointer(),
      ruleBasedOwnership: getDefaultLocksAndPointer(),
    };
    const mockStorage: Storage<LockInfoStorage> = {
      setItem: jest.fn((key, value) => {
        memoryStorage[key] = value;
        return Promise.resolve();
      }),
      getItem: jest.fn((key) => {
        return Promise.resolve(memoryStorage[key]);
      }),
      removeItem: jest.fn(),
      hasItem: jest.fn(),
    };

    const locksManager = new LocksManager({ storage: mockStorage });

    expect(
      await locksManager.getlockInfoByLock({
        lock: { codeHash: '0x', args: '0x', hashType: 'type' },
      }),
    ).toEqual(undefined);
  });
});
describe('locksManager', () => {
  let locksManager: LocksManager;
  let mockStorage: Storage<LockInfoStorage>;
  beforeEach(() => {
    const memoryStorage: LockInfoStorage = {
      fullOwnership: generateLocksAndPointers({ fullOwnership: true }),
      ruleBasedOwnership: generateLocksAndPointers({ fullOwnership: false }),
    };
    mockStorage = {
      setItem: jest.fn((key, value) => {
        memoryStorage[key] = value;
        return Promise.resolve();
      }),
      getItem: jest.fn((key) => {
        return Promise.resolve(memoryStorage[key]);
      }),
      removeItem: jest.fn(),
      hasItem: jest.fn(),
    };
    locksManager = new LocksManager({ storage: mockStorage });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('fullExternalProvider should return 1st external lock when call next()', async () => {
    const provider = await locksManager.fullExternalProvider();
    expect(provider.current()).toEqual(undefined);
    expect(provider.next()).toEqual(mockFullOwnershipLockInfosExternal[0]);

    expect(provider.items.size()).toEqual(20);
    provider.takeAndSupply(0, generateLockInfo(101));
    expect(provider.items.size()).toEqual(21);
    const offChains = await mockStorage.getItem('fullOwnership');
    expect(offChains?.details.offChain.external.length).toEqual(21);
  });
  it('fullChangeProvider should return 1st internal lock when call next()', async () => {
    const provider = await locksManager.fullChangeProvider();
    expect(provider.current()).toEqual(undefined);
    expect(provider.next()).toEqual(mockFullOwnershipLockInfosChange[0]);

    expect(provider.items.size()).toEqual(20);
    provider.takeAndSupply(0, generateLockInfo(101));
    expect(provider.items.size()).toEqual(21);
    const offChains = await mockStorage.getItem('fullOwnership');
    expect(offChains?.details.offChain.change.length).toEqual(21);
  });
  it('ruleBasedOnChainLockProvider should return 1st lock when call next()', async () => {
    const provider = await locksManager.ruleBasedProvider();
    expect(provider.current()).toEqual(undefined);
    expect(provider.next()).toEqual(mockRuleBasedOwnershipLockInfos[0]);

    expect(provider.items.size()).toEqual(20);
    provider.takeAndSupply(0, generateLockInfo(101));
    expect(provider.items.size()).toEqual(21);
    const offChains = await mockStorage.getItem('ruleBasedOwnership');
    expect(offChains?.details.offChain.external.length).toEqual(21);
  });

  it('fullOnChainLockProvider should return 1st external lock when call getNextLock()', async () => {
    const provider = await locksManager.fullOnChainLockProvider();
    expect(provider.getNextLock({})).toEqual({
      cursor: {
        index: 1,
        parentPath: "m/44'/309'/0'/0",
      },
      lockInfo: { ...mockFullOwnershipLockInfosExternal[1], onchain: true },
    });
  });
  it('rule based onChainLockProvider should return 1st external lock when call getNextLock()', async () => {
    const provider = await locksManager.ruleBasedOnChainLockProvider();
    expect(provider.getNextLock({})).toEqual({
      cursor: {
        index: 1,
        parentPath: "m/4410179'/0'",
      },
      lockInfo: { ...mockRuleBasedOwnershipLockInfos[1], onchain: true },
    });
  });
});
