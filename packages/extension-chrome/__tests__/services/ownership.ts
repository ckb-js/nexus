import { createMockBackend, createMockKeystoreService } from './utils';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { errors } from '@nexus-wallet/utils';
import { Backend } from '../../src/services/backend/backend';
import { DefaultAddressStorage } from '../../src/services/backend/addressStorage';
import { createOwnershipService } from '../../src/services/ownership';
import { NotificationService } from '@nexus-wallet/types/lib';
import { Cell, Output, Script, Transaction } from '@ckb-lumos/base';

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

const fixtures: { pubkey: string; lock: Script }[] = new Array(50).fill(0).map((_, i) => ({
  pubkey: `0x${String(i).padStart(2, '0').repeat(33)}`,
  lock: {
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
  },
}));

it('ownership#get used locks return empty list', async () => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({ getChildPubkey: () => fixtures[0].pubkey });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({ cursor: '', objects: [] });
});

it('ownership#get used locks return fisrt lock', async () => {
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
  const mockKeystoreService = createMockKeystoreService({ getChildPubkey: () => fixtures[0].pubkey });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({
    cursor: '',
    objects: [fixtures[0].lock],
  });
});
it('ownership#get used locks return 1st lock and 3rd lock', async () => {
  const mockBackend: Backend = createMockBackend({
    hasHistory: jest
      .fn()
      .mockReturnValueOnce(Promise.resolve(true)) // m/44'/309'/0'/0/0
      .mockReturnValueOnce(Promise.resolve(false)) // m/44'/309'/0'/0/1
      .mockReturnValueOnce(Promise.resolve(true)) // m/44'/309'/0'/0/2
      .mockReturnValue(Promise.resolve(false)),
  });
  const mockKeystoreService = createMockKeystoreService({
    getChildPubkey: jest.fn().mockImplementation(({ index }) => {
      return fixtures[index].pubkey;
    }),
  });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
  const usedLocks = await service.getUsedLocks({});

  expect(usedLocks).toEqual({
    cursor: '',
    objects: [fixtures[0].lock, fixtures[2].lock],
  });
});

it('ownership#sign data with 1st lock', async () => {
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
  const mockSignMessage = jest.fn().mockImplementation(() => Promise.resolve('0x'));
  const mockKeystoreService = createMockKeystoreService({
    getChildPubkey: () => fixtures[0].pubkey,
    mockSignMessage,
  });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
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
  await service.signData({ data: message, lock: fixtures[0].lock });
  expect(mockSignMessage).toBeCalledWith({ message, path: `m/44'/309'/0'/0/0`, password: '123456' });
});

it('ownership#get live cells', async () => {
  const mockCells: Cell[] = [
    {
      cellOutput: {
        capacity: '0x1234',
        lock: fixtures[0].lock,
      },
      data: '0x',
    },
  ];
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({
    hasHistory: mockCallback,
    getLiveCells: jest.fn().mockReturnValue(Promise.resolve([mockCells[0]])),
  });
  const mockKeystoreService = createMockKeystoreService({ getChildPubkey: () => fixtures[0].pubkey });
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
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
        lock: fixtures[0].lock,
      },
      data: '0x',
    },
    {
      cellOutput: {
        capacity: '0x5678',
        lock: fixtures[1].lock,
      },
      data: '0x',
    },
  ];
  const mockInputCells: Output[] = [
    {
      capacity: '0x1234',
      lock: fixtures[0].lock,
    },
    {
      capacity: '0x5678',
      lock: fixtures[1].lock,
    },
  ];
  const mockTx: Transaction = {
    headerDeps: [],
    outputsData: [],
    version: '0x01',
    inputs: [
      {
        previousOutput: {
          index: '0x0',
          txHash: '0x45def2fa2371895941e9e0b26ef9c27dca3ab446238548a472fed3b8ccc799f6',
        },
        since: '0x0',
      },
      {
        previousOutput: {
          index: '0x0',
          txHash: '0x9fb88345432208ea1182987ff62b7911de877e74c8016cf4af5168815ce30480',
        },
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
    getTxOutputByOutPoints: jest.fn().mockReturnValue(Promise.resolve([mockInputCells[0], mockInputCells[1]])),
  });
  const mockSignatures = ['0x01', '0x02'];
  const mockKeystoreService = createMockKeystoreService({
    getChildPubkey: () => fixtures[0].pubkey,
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
      lock: fixtures[0].lock,
    },
    {
      path: `m/44'/309'/0'/0/1`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: fixtures[1].lock,
    },
  ]);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);

  const result = await service.signTransaction({ tx: mockTx });

  expect(result).toEqual([
    [fixtures[0].lock, mockSignatures[0]],
    [fixtures[1].lock, mockSignatures[1]],
  ]);
});
