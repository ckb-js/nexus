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

describe('probe task', () => {
  it('should supplyOffChainAddresses if not enough', async () => {
    const mockBackend: Backend = createMockBackend({});
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) =>
        [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find((info) => info.path === path)!
          .publicKey,
    });
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

    const probeTask = ProbeTask.getInstance({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      storage: mockStorage,
    });

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
    const mockBackend: Backend = createMockBackend({});
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) =>
        [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find((info) => info.path === path)!
          .publicKey,
    });
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

    const probeTask = ProbeTask.getInstance({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      storage: mockStorage,
    });
    expect(probeTask.running).toBe(false);
    probeTask.run();
    (() => {
      return new Promise((resolve) => setTimeout(resolve, 3_000));
    })();
    expect(probeTask.running).toBe(true);
    probeTask.stop();
  });
});
