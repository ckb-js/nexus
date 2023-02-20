import { DefaultLiveCellCursor, DefaultLockCursor } from '../../../src/services/ownership/cursor';
import {
  createMockBackend,
  createMockKeystoreService,
  generateBlankFullLocksAndPointers,
  generateBlankRuleBasedLocksAndPointers,
  generateFullLocksAndPointers,
  generateRuleBasedLocksAndPointers,
  mockFullOwnershipLockInfos,
  mockFullOwnershipLockInfosExternal,
  mockRuleBasedOwnershipLockInfos,
} from './common/utils';
import { LocksManager } from '../../../src/services/ownership/locksManager';
import { LockInfoStorage } from '../../../src/services/ownership/types';
import {
  createOwnershipServices,
  getOffChainLockProvider,
  getOnchainLockProvider,
} from '../../../src/services/ownershipService';
import { Storage, KeystoreService, NotificationService, OwnershipService } from '@nexus-wallet/types';
import { Backend } from '../../../src/services/ownership/backend';
import { indexOfPath, parentOfPath } from '../../../src/services/ownership/utils';
import { Cell, Transaction } from '@ckb-lumos/base';

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
    signMessage: jest.fn().mockImplementation(() => Promise.resolve('0x')),
    getPublicKeyByPath: ({ path }) =>
      [...mockFullOwnershipLockInfos, ...mockRuleBasedOwnershipLockInfos].find(
        (info) => info.index === indexOfPath(path) && info.parentPath === parentOfPath(path),
      )!.publicKey,
  });
  mockNotificationService = {
    requestSignTransaction: jest.fn().mockImplementation(() => Promise.resolve({ password: '123456' })),
    requestSignData: jest.fn().mockImplementation(() => Promise.resolve({ password: '123456' })),
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
});
describe('full ownership with non-empty storage', () => {
  let fullOwnershipService: OwnershipService;
  beforeEach(() => {
    mockBackend = createMockBackend({
      getNextLiveCellWithCursor: jest.fn().mockResolvedValue(
        Promise.resolve({
          cursor: 'indexer_cursor_0xa0',
          objects: [
            createCell('0x01'),
            createCell('0x02'),
            createCell('0x03'),
            createCell('0x04'),
            createCell('0x05'),
            createCell('0x06'),
            createCell('0x07'),
            createCell('0x08'),
            createCell('0x09'),
            createCell('0xa0'),
          ],
        }),
      ),
      getLiveCellFetcher: () =>
        function (): Promise<Cell> {
          return Promise.resolve({
            outPoint: {
              index: '0x0',
              txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
            cellOutput: {
              capacity: '0x1234',
              lock: {
                args: '0x',
                codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
                hashType: 'type' as const,
              },
            },
            data: '0x',
          } as Cell);
        },
    });
    memoryStorage = {
      full: generateFullLocksAndPointers(),
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
    fullOwnershipService = createOwnershipServices({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      locksManager,
    }).fullOwnershipService;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should get next offchain locks', async () => {
    expect(await fullOwnershipService.getOffChainLocks({})).toEqual([
      {
        args: '0x',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hashType: 'type',
      },
    ]);
  });
  it('should get next offchain internal locks', async () => {
    expect(await fullOwnershipService.getOffChainLocks({ change: 'internal' })).toEqual([
      {
        args: '0x',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hashType: 'type',
      },
    ]);
  });
  it('should get next onchain locks without cursor', async () => {
    expect(await fullOwnershipService.getOnChainLocks({})).toEqual({
      cursor: new DefaultLockCursor("m/44'/309'/0'/0", 1).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should get next onchain locks without cursor, internal', async () => {
    expect(await fullOwnershipService.getOnChainLocks({ change: 'internal' })).toEqual({
      cursor: new DefaultLockCursor("m/44'/309'/0'/1", 1).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should get next onchain locks with some cursor', async () => {
    const cursor = new DefaultLockCursor("m/44'/309'/0'/0", 1).encode();
    expect(await fullOwnershipService.getOnChainLocks({ cursor })).toEqual({
      cursor: new DefaultLockCursor("m/44'/309'/0'/0", 2).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should get next onchain locks with some cursor, internal', async () => {
    const cursor = new DefaultLockCursor("m/44'/309'/0'/1", 1).encode();
    expect(await fullOwnershipService.getOnChainLocks({ cursor, change: 'internal' })).toEqual({
      cursor: new DefaultLockCursor("m/44'/309'/0'/1", 2).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should only the first page of cells will be fetched', async () => {
    await fullOwnershipService.getLiveCells();
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledTimes(1);
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledWith({
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
      filter: { limit: 10 },
    });
  });
  it('should return paginated when the cursor is non-empty', async () => {
    const liveCellCursor = new DefaultLiveCellCursor("m/44'/309'/0'/0", 1, 'indexer_cursor_0x01');
    await fullOwnershipService.getLiveCells({ cursor: liveCellCursor.encode() });
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledTimes(1);
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledWith({
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
      filter: { limit: 10, indexerCursor: 'indexer_cursor_0x01' },
    });
  });
  it('should signData with payload lock', async () => {
    await fullOwnershipService.signData({
      data: '0x123',
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
    });
    expect(mockNotificationService.requestSignData).toBeCalledWith({ data: '0x123' });
    expect(mockKeystoreService.signMessage).toBeCalledWith({
      message: '0x123',
      password: '123456',
      path: "m/44'/309'/0'/0/0",
    });
  });
  it('should sign tx', async () => {
    await fullOwnershipService.signTransaction({
      tx: mockTx,
    });
    expect(mockNotificationService.requestSignTransaction).toBeCalledWith({ tx: mockTx });
    expect(mockKeystoreService.signMessage).toBeCalledTimes(1);
    expect(mockKeystoreService.signMessage).toBeCalledWith({
      message: '0xbb289e7c2f8cb2551140b45a892966e73a0312d493547e3430dc5eec25677d05',
      password: '123456',
      path: "m/44'/309'/0'/0/0",
    });
  });
});

describe('rulebased ownership with non-empty storage', () => {
  let ruleBasedOwnershipService: OwnershipService;
  beforeEach(() => {
    mockBackend = createMockBackend({
      getNextLiveCellWithCursor: jest.fn().mockResolvedValue(
        Promise.resolve({
          cursor: 'indexer_cursor_0x05',
          objects: [createCell('0x01'), createCell('0x02'), createCell('0x03'), createCell('0x04'), createCell('0x05')],
        }),
      ),
      getLiveCellFetcher: () =>
        function (): Promise<Cell> {
          return Promise.resolve({
            outPoint: {
              index: '0x0',
              txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
            cellOutput: {
              capacity: '0x1234',
              lock: {
                args: '0x',
                codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
                hashType: 'type' as const,
              },
            },
            data: '0x',
          } as Cell);
        },
    });
    memoryStorage = {
      full: generateBlankFullLocksAndPointers(),
      ruleBased: generateRuleBasedLocksAndPointers(),
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
    ruleBasedOwnershipService = createOwnershipServices({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      locksManager,
    }).ruleBasedOwnershipService;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should get next offchain locks', async () => {
    expect(await ruleBasedOwnershipService.getOffChainLocks({})).toEqual([
      {
        args: '0x',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hashType: 'type',
      },
    ]);
  });
  it('should get next onchain locks without cursor', async () => {
    expect(await ruleBasedOwnershipService.getOnChainLocks({})).toEqual({
      cursor: new DefaultLockCursor("m/4410179'/0'", 1).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should get next onchain locks with some cursor', async () => {
    const cursor = new DefaultLockCursor("m/4410179'/0'", 1).encode();
    expect(await ruleBasedOwnershipService.getOnChainLocks({ cursor })).toEqual({
      cursor: new DefaultLockCursor("m/4410179'/0'", 2).encode(),
      objects: [
        {
          args: '0x',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      ],
    });
  });
  it('should only the first page of cells will be fetched', async () => {
    await ruleBasedOwnershipService.getLiveCells();
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledTimes(2);
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledWith({
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
      filter: { limit: 10 },
    });
  });
  it('should return paginated when the cursor is non-empty', async () => {
    const liveCellCursor = new DefaultLiveCellCursor("m/4410179'/0'", 1, 'indexer_cursor_0x01');
    await ruleBasedOwnershipService.getLiveCells({ cursor: liveCellCursor.encode() });
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledTimes(2);
    expect(mockBackend.getNextLiveCellWithCursor).toBeCalledWith({
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
      filter: { limit: 10, indexerCursor: 'indexer_cursor_0x01' },
    });
  });
  it('should signData with payload lock', async () => {
    await ruleBasedOwnershipService.signData({
      data: '0x123',
      lock: {
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x',
        hashType: 'type',
      },
    });
    expect(mockNotificationService.requestSignData).toBeCalledWith({ data: '0x123' });
    expect(mockKeystoreService.signMessage).toBeCalledWith({
      message: '0x123',
      password: '123456',
      path: "m/4410179'/0'/0",
    });
  });
  it('should sign tx', async () => {
    await ruleBasedOwnershipService.signTransaction({
      tx: mockTx,
    });
    expect(mockNotificationService.requestSignTransaction).toBeCalledWith({ tx: mockTx });
    expect(mockKeystoreService.signMessage).toBeCalledTimes(1);
    expect(mockKeystoreService.signMessage).toBeCalledWith({
      message: '0xbb289e7c2f8cb2551140b45a892966e73a0312d493547e3430dc5eec25677d05',
      password: '123456',
      path: "m/4410179'/0'/0",
    });
  });
});

describe('utility functions', () => {
  it('should getOnchainLockProvider throw error if type not valid', async () => {
    await expect(() =>
      getOnchainLockProvider({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'invalid-type' as unknown as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locksManager: undefined as any,
      }),
    ).rejects.toBeDefined();
  });
  it('should getOnchainLockProvider throw error if type not valid', async () => {
    await expect(() =>
      getOffChainLockProvider(
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'invalid-type' as unknown as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locksManager: undefined as any,
        },
        {},
      ),
    ).rejects.toBeDefined();
  });
});

function createCell(args: string): Cell {
  return {
    cellOutput: {
      capacity: '0x1234',
      lock: {
        args,
        codeHash: '0x0000',
        hashType: 'type' as const,
      },
    },
    data: '0x',
    outPoint: {
      txHash: '0x0000000000000000',
      index: '0x0',
    },
  } as Cell;
}
