import { createMockBackend, createMockKeystoreService } from './utils';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { errors } from '@nexus-wallet/utils';
import { Backend } from '../../src/services/backend/backend';
import { DefaultAddressStorage } from '../../src/services/backend/addressStorage';
import { createOwnershipService } from '../../src/services/ownership';
import { NotificationService } from '@nexus-wallet/types/lib';
import { Cell, Script } from '@ckb-lumos/base';

const mockNotificationService: NotificationService = {
  requestSignTransaction: function (): Promise<{ password: string }> {
    errors.unimplemented();
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
  const mockKeystoreService = createMockKeystoreService(() => fixtures[0].pubkey);
  const mockAddressStorage = new DefaultAddressStorage(mockBackend, mockKeystoreService);

  const service = createOwnershipService(mockKeystoreService, mockNotificationService, mockAddressStorage, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({ cursor: '', objects: [] });
});

it('ownership#get used locks return fisrt lock', async () => {
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(false));
  const mockBackend: Backend = createMockBackend({ hasHistory: mockCallback });
  const mockKeystoreService = createMockKeystoreService(() => fixtures[0].pubkey);
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
  const mockKeystoreService = createMockKeystoreService(
    jest.fn().mockImplementation(({ index }) => {
      return fixtures[index].pubkey;
    }),
  );
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
  const mockKeystoreService = createMockKeystoreService(() => fixtures[0].pubkey, mockSignMessage);
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
  const presetCells: Cell[] = [
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
    getLiveCells: jest.fn().mockReturnValue(Promise.resolve([presetCells[0]])),
  });
  const mockKeystoreService = createMockKeystoreService(() => fixtures[0].pubkey);
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
    objects: [presetCells[0]],
  });
});
