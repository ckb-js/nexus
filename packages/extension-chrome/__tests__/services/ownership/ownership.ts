import {
  createMockBackend,
  createMockKeystoreService,
  generateBlankFullLocksAndPointers,
  generateBlankRuleBasedLocksAndPointers,
  mockFullOwnershipLockInfos,
  mockFullOwnershipLockInfosExternal,
  mockRuleBasedOwnershipLockInfos,
} from './common/utils';
import { LocksManager } from '../../../src/services/ownership/locksManager';
import { LockInfoStorage } from '../../../src/services/ownership/types';
import { createOwnershipServices } from '../../../src/services/ownershipService';
import { Storage, KeystoreService, NotificationService, OwnershipService } from '@nexus-wallet/types';
import { Backend } from '../../../src/services/ownership/backend';
import { indexOfPath, parentOfPath } from '../../../src/services/ownership/utils';
import { Cell, Transaction } from '@ckb-lumos/base';
import { ProbeTask } from '../../../src/services/ownership/probeTask';

let mockBackend: Backend;
let mockKeystoreService: KeystoreService;
let mockNotificationService: NotificationService;
let memoryStorage: LockInfoStorage;
let mockStorage: Storage<LockInfoStorage>;
let locksManager: LocksManager;
beforeEach(() => {
  mockBackend = createMockBackend({
    getLiveCellFetcher: () =>
      function (): Promise<Cell> {
        return Promise.resolve({
          outPoint: {
            index: '0x0',
            txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
          cellOutput: {
            capacity: '0x1234',
            lock: mockFullOwnershipLockInfosExternal[0].lock,
          },
          data: '0x',
        } as Cell);
      },
  });
  mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) =>
      [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find(
        (info) => info.index === indexOfPath(path) && info.parentPath === parentOfPath(path),
      )!.publicKey,
  });
  mockNotificationService = {
    requestSignTransaction: () => Promise.resolve({ password: '123456' }),
    requestSignData: () => Promise.resolve({ password: '123456' }),
    requestGrant: () => Promise.resolve(),
  };
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
  locksManager = new LocksManager({ storage: mockStorage });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ownership', () => {
  it('should create full ownership and rule-based ownership', async () => {
    const { fullOwnershipService, ruleBasedOwnershipService } = createOwnershipServices({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      locksManager,
    });

    expect(fullOwnershipService).toBeDefined();
    expect(ruleBasedOwnershipService).toBeDefined();
  });
});

const mockInputCells: Cell[] = [
  {
    outPoint: {
      index: '0x0',
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    cellOutput: {
      capacity: '0x1234',
      lock: mockFullOwnershipLockInfosExternal[0].lock,
    },
    data: '0x',
  },
  {
    outPoint: {
      index: '0x0',
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    cellOutput: {
      capacity: '0x5678',
      lock: mockFullOwnershipLockInfosExternal[1].lock,
    },
    data: '0x',
  },
];
const mockTx: Transaction = {
  headerDeps: [],
  outputsData: [],
  version: '0x01',
  inputs: [
    {
      previousOutput: mockInputCells[0].outPoint!,
      since: '0x0',
    },
    {
      previousOutput: mockInputCells[1].outPoint!,
      since: '0x0',
    },
  ],
  outputs: [
    {
      capacity: '0x1234',
      lock: {
        args: '0x01',
        codeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        hashType: 'type',
      },
    },
    {
      capacity: '0x5678',
      lock: {
        args: '0x01',
        codeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        hashType: 'type',
      },
    },
  ],
  cellDeps: [
    {
      outPoint: {
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        index: '0x0',
      },
      depType: 'depGroup',
    },
  ],
  witnesses: ['0x0001', '0x1234'],
};

describe('initial full-ownership', () => {
  let fullOwnershipService: OwnershipService;
  beforeEach(() => {
    fullOwnershipService = createOwnershipServices({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      locksManager,
    }).fullOwnershipService;
  });
  it('should get empty results when the store is not synced', async () => {
    expect(await fullOwnershipService.getOnChainLocks({})).toEqual({ cursor: '', objects: [] });
    expect(await fullOwnershipService.getOffChainLocks({})).toEqual([]);
    expect(await fullOwnershipService.getLiveCells({})).toEqual({ cursor: '', objects: [] });
  });
  it('should signData throw error when the lock in payload not found', async () => {
    await expect(
      async () =>
        await fullOwnershipService.signData({
          data: '0x123',
          lock: { codeHash: '0xab', args: '0x', hashType: 'type' },
        }),
    ).rejects.toBeInstanceOf(Error);
  });
  it('should signTransaction return empty result when the lock in payload not found', async () => {
    expect(await fullOwnershipService.signTransaction({ tx: mockTx })).toEqual([]);
  });
});

describe('full-ownership with probe task running in the backgroud', () => {
  let fullOwnershipService: OwnershipService;
  let probeTask: ProbeTask;
  beforeEach(() => {
    fullOwnershipService = createOwnershipServices({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      locksManager,
    }).fullOwnershipService;
    probeTask = ProbeTask.getInstance({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      storage: mockStorage,
    });
    jest.useFakeTimers();
    probeTask.run();
    jest.advanceTimersByTime(11_000);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  it('should get one offchain lock when the store is synced', async () => {
    await expect(fullOwnershipService.getOffChainLocks({})).resolves.toHaveLength(1);
  });
});
