import { Backend } from '../../../../src/services/ownership/backend';
import {
  createMockBackend,
  createMockKeystoreService,
  mockFullOwnershipLockInfos,
  mockRuleBasedOwnershipLockInfos,
  generateBlankFullLocksAndPointers,
  generateBlankRuleBasedLocksAndPointers,
} from './utils';
import { ProbeTask } from '../../../../src/services/ownership/probeTask';
import { Storage } from '@nexus-wallet/types';
import { indexOfPath, offChain, parentOfPath } from '../../../../src/services/ownership/utils';
import { LockInfoStorage } from '../../../../src/services/ownership/types';

let probeTask: ProbeTask;
let memoryStorage: LockInfoStorage;
let mockStorage: Storage<LockInfoStorage>;
beforeAll(() => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) =>
      [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find(
        (info) => info.index === indexOfPath(path) && info.parentPath === parentOfPath(path),
      )!.publicKey,
  });
  memoryStorage = {
    full: generateBlankFullLocksAndPointers(),
    ruleBased: generateBlankRuleBasedLocksAndPointers(),
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
    await probeTask.supplyFullOffChainAddresses();
    const externalOffChainLocks = offChain({ lockInfos: memoryStorage.full.lockInfos.external });
    const internalOffChainLocks = offChain({ lockInfos: memoryStorage.full.lockInfos.change });
    for (let i = 0; i < externalOffChainLocks.length; i++) {
      expect(externalOffChainLocks[i].index).toEqual(i);
      expect(internalOffChainLocks[i].index).toEqual(i);
    }
  });
  // it('should supplyOffChainAddresses if not enough', async () => {
  //   await probeTask.supplyRuleBasedOffChainAddresses();
  //   expect(memoryStorage.ruleBased).toEqual({
  //     details: {
  //       offChain: {
  //         external: mockRuleBasedOwnershipLockInfos.slice(0, 50),
  //         change: [],
  //       },
  //       onChain: {
  //         external: [],
  //         change: [],
  //       },
  //     },
  //     pointer: generateRuleBasedLocksAndPointers().pointer,
  //   });

  // });

  // it('should run probe task', async () => {
  //   expect(probeTask.running).toBe(false);
  //   jest.useFakeTimers();
  //   const logSpy = jest.spyOn(console, 'log');
  //   probeTask.run();
  //   // the second call will be ignored
  //   probeTask.run();
  //   jest.advanceTimersByTime(10_000);
  //   expect(logSpy).toBeCalledWith('probe task running...');
  //   expect(probeTask.running).toBe(true);
  //   probeTask.stop();
  //   jest.clearAllTimers();
  //   logSpy.mockRestore();
  // });

  // it('should sync from scratch', async () => {
  //   await probeTask.syncAllLocksInfo();
  //   expect(mockStorage.setItem).toBeCalledTimes(6);
  // });
});
