import {
  createMockBackend,
  createMockKeystoreService,
  generateLocksAndPointers,
  mockFullOwnershipLockInfos,
} from './utils';
import { errors } from '@nexus-wallet/utils';
import { Backend } from '../../src/services/backend/backend';
import { createOwnershipService } from '../../src/services/ownershipService';
import { NotificationService } from '@nexus-wallet/types/lib';
import { Cell, Transaction } from '@ckb-lumos/base';
import { LocksProvider } from '../../src/services/backend/locksProvider';
import { getDefaultLocksAndPointer } from '../../src/services/backend/utils';

const mockNotificationService: NotificationService = {
  requestSignTransaction: function (): Promise<{ password: string }> {
    return Promise.resolve({ password: '123456' });
  },
  requestSignData: function (): Promise<{ password: string }> {
    return Promise.resolve({ password: '123456' });
  },
  requestGrant: function (): Promise<void> {
    errors.unimplemented();
  },
};

it('ownership#should return an empty list if no tx record', async () => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
  });
  const locksAndPointer = getDefaultLocksAndPointer();
  const mockLocksProvider = new LocksProvider({
    backend: mockBackend,
    keystoreService: mockKeystoreService,
    lockDetail: locksAndPointer,
  });

  const service = createOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    locksProvider: mockLocksProvider,
    backend: mockBackend,
  });
  const usedLocks = await service.getOnChainLocks({});
  expect(usedLocks).toEqual({ cursor: '', objects: [] });
});
it('ownership#sign data with 1st lock', async () => {
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
  const mockSignMessage = jest.fn().mockImplementation(() => Promise.resolve('0x'));
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
    signMessage: mockSignMessage,
  });
  const locksAndPointer = generateLocksAndPointers({ fullOwnership: true });
  const mockLocksProvider = new LocksProvider({
    backend: mockBackend,
    keystoreService: mockKeystoreService,
    lockDetail: locksAndPointer,
  });

  const service = createOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    locksProvider: mockLocksProvider,
    backend: mockBackend,
  });

  const message = '0x1234';
  await service.signData({ data: message, lock: mockFullOwnershipLockInfos[0].lock });
  expect(mockSignMessage).toBeCalledWith({ message, path: `m/44'/309'/0'/0/0`, password: '123456' });
});

it('ownership#get live cells', async () => {
  const mockCells: Cell[] = [
    {
      cellOutput: {
        capacity: '0x1234',
        lock: mockFullOwnershipLockInfos[0].lock,
      },
      data: '0x',
    },
  ];
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({
    hasHistory: mockCallback,
    getLiveCells: jest.fn().mockReturnValue(Promise.resolve([mockCells[0]])),
  });
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
  });
  const locksAndPointer = generateLocksAndPointers({ fullOwnership: true });
  const mockLocksProvider = new LocksProvider({
    backend: mockBackend,
    keystoreService: mockKeystoreService,
    lockDetail: locksAndPointer,
  });

  const service = createOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    locksProvider: mockLocksProvider,
    backend: mockBackend,
  });

  const getLiveCellsResult = await service.getLiveCells();
  expect(getLiveCellsResult).toEqual({
    cursor: '',
    objects: [mockCells[0]],
  });
});

it('ownership#sign tx', async () => {
  const mockCells: Cell[] = [
    {
      cellOutput: {
        capacity: '0x1234',
        lock: mockFullOwnershipLockInfos[0].lock,
      },
      data: '0x',
    },
    {
      cellOutput: {
        capacity: '0x5678',
        lock: mockFullOwnershipLockInfos[1].lock,
      },
      data: '0x',
    },
  ];
  const mockInputCells: Cell[] = [
    {
      outPoint: {
        index: '0x0',
        txHash: '0x45def2fa2371895941e9e0b26ef9c27dca3ab446238548a472fed3b8ccc799f6',
      },
      cellOutput: {
        capacity: '0x1234',
        lock: mockFullOwnershipLockInfos[0].lock,
      },
      data: '0x',
    },
    {
      outPoint: {
        index: '0x0',
        txHash: '0x9fb88345432208ea1182987ff62b7911de877e74c8016cf4af5168815ce30480',
      },
      cellOutput: {
        capacity: '0x5678',
        lock: mockFullOwnershipLockInfos[1].lock,
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
        capacity: '0x28fa6ae00',
        lock: {
          args: '0xed20af7322823d0dc33bfb215486a05082669905',
          codeHash: '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
          hashType: 'type',
        },
      },
      {
        capacity: '0x2186f9360',
        lock: {
          args: '0x92764594e255afbb89cd9486b0035c393b2c5323',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      },
    ],
    cellDeps: [
      {
        outPoint: {
          txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
          index: '0x0',
        },
        depType: 'depGroup',
      },
    ],
    witnesses: ['0x0001', '0x1234'],
  };
  const mockCallback = jest
    .fn()
    .mockReturnValueOnce(Promise.resolve(true)) // m/44'/309'/0'/0/0
    .mockReturnValueOnce(Promise.resolve(true)) // m/44'/309'/0'/0/1
    .mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({
    hasHistory: mockCallback,
    getLiveCells: jest.fn().mockReturnValue(Promise.resolve([mockCells[0], mockCells[1]])),
    getLiveCellFetcher: () =>
      jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(mockInputCells[0]))
        .mockReturnValueOnce(Promise.resolve(mockInputCells[1])),
  });
  const mockSignatures = ['0x01', '0x02'];
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
    signMessage: jest
      .fn()
      .mockReturnValueOnce(mockSignatures[0]) // first signature
      .mockReturnValueOnce(mockSignatures[1]), // second signature
  });

  const locksAndPointer = generateLocksAndPointers({ fullOwnership: true });
  const mockLocksProvider = new LocksProvider({
    backend: mockBackend,
    keystoreService: mockKeystoreService,
    lockDetail: locksAndPointer,
  });

  const service = createOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    locksProvider: mockLocksProvider,
    backend: mockBackend,
  });

  const result = await service.signTransaction({ tx: mockTx });

  expect(result).toEqual([
    [mockFullOwnershipLockInfos[0].lock, mockSignatures[0]],
    [mockFullOwnershipLockInfos[1].lock, mockSignatures[1]],
  ]);
});
