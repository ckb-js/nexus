import { createMockBackend, createMockKeystoreService, mockAddressInfos } from './utils';
import { errors } from '@nexus-wallet/utils';
import { Backend } from '../../src/services/backend/backend';
import { DefaultAddressStorage } from '../../src/services/backend/addressStorage';
import { createFullOwnershipService } from '../../src/services/fullOwnership';
import { NotificationService } from '@nexus-wallet/types/lib';
import { Cell, Transaction } from '@ckb-lumos/base';

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

describe('usedLocks and unusedLocks in ownership', () => {
  it('should return an empty list if no tx record', async () => {
    const mockBackend: Backend = createMockBackend({});
    const mockKeystoreService = createMockKeystoreService({ getPublicKeyByPath: () => mockAddressInfos[0].pubkey });
    const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

    const service = createFullOwnershipService({
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      addressStorageService: mockAddressStorage,
      backend: mockBackend,
    });
    const usedLocks = await service.getUsedLocks({});
    expect(usedLocks).toEqual({ cursor: '', objects: [] });
  });
  it('should return a list with a lock if there is one history', async () => {
    const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
    const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
    const mockKeystoreService = createMockKeystoreService({ getPublicKeyByPath: () => mockAddressInfos[0].pubkey });
    const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

    const service = createFullOwnershipService({
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      addressStorageService: mockAddressStorage,
      backend: mockBackend,
    });
    const usedLocks = await service.getUsedLocks({});
    expect(usedLocks).toEqual({
      cursor: '',
      objects: [mockAddressInfos[0].lock],
    });
  });
  it('should return a list with 1st lock and 3rd lock if there is corresponding history', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn(({ lock }) => {
        if (lock.args === mockAddressInfos[0].lock.args) return Promise.resolve(true); // m/44'/309'/0'/0/0
        if (lock.args === mockAddressInfos[1].lock.args) return Promise.resolve(false); // m/44'/309'/0'/0/1
        if (lock.args === mockAddressInfos[2].lock.args) return Promise.resolve(true); // m/44'/309'/0'/0/2
        return Promise.resolve(false);
      }),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: jest.fn().mockImplementation(({ path }) => {
        const index = parseInt(path.split('/').pop() as string, 10);
        return mockAddressInfos[index].pubkey;
      }),
    });
    const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

    const service = createFullOwnershipService({
      keystoreService: mockKeystoreService,
      notificationService: mockNotificationService,
      addressStorageService: mockAddressStorage,
      backend: mockBackend,
    });
    const usedLocks = await service.getUsedLocks({});

    expect(usedLocks).toEqual({
      cursor: '',
      objects: [mockAddressInfos[0].lock, mockAddressInfos[2].lock],
    });
  });
});
it('ownership#sign data with 1st lock', async () => {
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
  const mockSignMessage = jest.fn().mockImplementation(() => Promise.resolve('0x'));
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: () => mockAddressInfos[0].pubkey,
    mockSignMessage,
  });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createFullOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    addressStorageService: mockAddressStorage,
    backend: mockBackend,
  });
  const usedExternalLocks = await service.getUsedLocks({});
  mockAddressStorage.setUsedExternalAddresses([
    {
      path: `m/44'/309'/0'/0/0`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: usedExternalLocks.objects[0],
    },
  ]);

  const message = '0x1234';
  await service.signData({ data: message, lock: mockAddressInfos[0].lock });
  expect(mockSignMessage).toBeCalledWith({ message, path: `m/44'/309'/0'/0/0`, password: '123456' });
});

it('ownership#get live cells', async () => {
  const mockCells: Cell[] = [
    {
      cellOutput: {
        capacity: '0x1234',
        lock: mockAddressInfos[0].lock,
      },
      data: '0x',
    },
  ];
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({
    hasHistory: mockCallback,
    getLiveCells: jest.fn().mockReturnValue(Promise.resolve([mockCells[0]])),
  });
  const mockKeystoreService = createMockKeystoreService({ getPublicKeyByPath: () => mockAddressInfos[0].pubkey });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createFullOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    addressStorageService: mockAddressStorage,
    backend: mockBackend,
  });
  const usedExternalLocks = await service.getUsedLocks({});
  mockAddressStorage.setUsedExternalAddresses([
    {
      path: `m/44'/309'/0'/0/0`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: usedExternalLocks.objects[0],
    },
  ]);

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
        lock: mockAddressInfos[0].lock,
      },
      data: '0x',
    },
    {
      cellOutput: {
        capacity: '0x5678',
        lock: mockAddressInfos[1].lock,
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
        lock: mockAddressInfos[0].lock,
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
        lock: mockAddressInfos[1].lock,
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
    getPublicKeyByPath: () => mockAddressInfos[0].pubkey,
    mockSignMessage: jest
      .fn()
      .mockReturnValueOnce(mockSignatures[0]) // first signature
      .mockReturnValueOnce(mockSignatures[1]), // second signature
  });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);
  mockAddressStorage.setUsedExternalAddresses([
    {
      path: `m/44'/309'/0'/0/0`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: mockAddressInfos[0].lock,
    },
    {
      path: `m/44'/309'/0'/0/1`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: mockAddressInfos[1].lock,
    },
  ]);

  const service = createFullOwnershipService({
    keystoreService: mockKeystoreService,
    notificationService: mockNotificationService,
    addressStorageService: mockAddressStorage,
    backend: mockBackend,
  });

  const result = await service.signTransaction({ tx: mockTx });

  expect(result).toEqual([
    [mockAddressInfos[0].lock, mockSignatures[0]],
    [mockAddressInfos[1].lock, mockSignatures[1]],
  ]);
});
