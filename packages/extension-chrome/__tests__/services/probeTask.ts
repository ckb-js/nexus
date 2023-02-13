import { Backend } from '../../src/services/backend/backend';
import {
  createMockBackend,
  createMockKeystoreService,
  mockFullOwnershipLockInfos,
  mockFullOwnershipLockInfosExternal,
  mockFullOwnershipLockInfosChange,
  mockRuleBasedOwnershipLockInfos,
} from './utils';
import { LockInfoStorage } from '../../src/services/backend/locksManager';
import { ProbeTask } from '../../src/services/backend/probeTask';
import { Storage } from '@nexus-wallet/types';
import { getDefaultLocksAndPointer } from '../../src/services/backend/utils';

let probeTask: ProbeTask;
let memoryStorage: LockInfoStorage;
let mockStorage: Storage<LockInfoStorage>;
beforeAll(() => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) =>
      [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find((info) => info.path === path)!.publicKey,
  });
  memoryStorage = {
    fullOwnership: getDefaultLocksAndPointer(),
    ruleBasedOwnership: getDefaultLocksAndPointer(),
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

  probeTask = ProbeTask.getInstance({
    backend: mockBackend,
    keystoreService: mockKeystoreService,
    storage: mockStorage,
  });
});

describe('probe task', () => {
  it('should supplyOffChainAddresses if not enough', async () => {
    await probeTask.supplyOffChainAddresses({ keyName: 'fullOwnership' });
    expect(memoryStorage.fullOwnership).toEqual({
      details: {
        offChain: {
          external: mockFullOwnershipLockInfosExternal.slice(0, 20),
          change: mockFullOwnershipLockInfosChange.slice(0, 20),
        },
        onChain: {
          external: [],
          change: [],
        },
      },
      pointers: getDefaultLocksAndPointer().pointers,
    });
    await probeTask.supplyOffChainAddresses({ keyName: 'ruleBasedOwnership' });
    expect(memoryStorage.ruleBasedOwnership).toEqual({
      details: {
        offChain: {
          external: mockRuleBasedOwnershipLockInfos.slice(0, 50),
          change: [],
        },
        onChain: {
          external: [],
          change: [],
        },
      },
      pointers: getDefaultLocksAndPointer().pointers,
    });
  });

  it('should run probe task', async () => {
    expect(probeTask.running).toBe(false);
    jest.useFakeTimers();
    const logSpy = jest.spyOn(console, 'log');
    probeTask.run();
    // the second call will be ignored
    probeTask.run();
    jest.advanceTimersByTime(10_000);
    expect(logSpy).toBeCalledWith('probe task running...');
    expect(probeTask.running).toBe(true);
    probeTask.stop();
    jest.clearAllTimers();
    logSpy.mockRestore();
  });

  it('should sync from scratch', async () => {
    await probeTask.syncAllLocksInfo();
    expect(mockStorage.setItem).toBeCalledTimes(2);
  });
});
