import { FullOwnershipAddressStorage, RuleBasedAddressStorage } from '../../src/services/backend/addressStorage';
import { Backend } from '../../src/services/backend/backend';
import {
  createMockBackend,
  createMockKeystoreService,
  mockFullOwnershipAddressInfos,
  mockRuleBasedOwnershipAddressInfos,
} from './utils';

it('addressStorage#set and get unused addresses', async () => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({
    getPublicKeyByPath: () => mockFullOwnershipAddressInfos[0].pubkey,
  });
  const mockAddressStorage = new FullOwnershipAddressStorage(mockBackend, mockKeystoreService);

  expect(await mockAddressStorage.getAllOffChainAddresses()).toEqual([]);
  mockAddressStorage.setOffChainExternalAddresses([mockFullOwnershipAddressInfos[0]]);
  expect(await mockAddressStorage.getAllOffChainAddresses()).toEqual([mockFullOwnershipAddressInfos[0]]);
});

describe('rule based ownership addressStorage', () => {
  it('sync address success when backend returns one hasTxHistory', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn().mockReturnValueOnce(true).mockReturnValue(false),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: () => mockRuleBasedOwnershipAddressInfos[0].pubkey,
    });
    const mockAddressStorage = new RuleBasedAddressStorage(mockBackend, mockKeystoreService);

    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([]);

    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([mockRuleBasedOwnershipAddressInfos[0]]);
  });

  it('sync address success when backend resolves 1st and 3rd lock has tx history', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn(({ lock }) => {
        if (lock.args === mockRuleBasedOwnershipAddressInfos[0].lock.args) return Promise.resolve(true); // m/4410179'/0'/0
        if (lock.args === mockRuleBasedOwnershipAddressInfos[2].lock.args) return Promise.resolve(true); // m/4410179'/0'/2
        return Promise.resolve(false);
      }),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockRuleBasedOwnershipAddressInfos.find((info) => info.path === path)!.pubkey,
    });
    const mockAddressStorage = new RuleBasedAddressStorage(mockBackend, mockKeystoreService);
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([]);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([
      mockRuleBasedOwnershipAddressInfos[0],
      mockRuleBasedOwnershipAddressInfos[2],
    ]);
  });
  it('should return first 50 off chain locks when calling getOffChainLocks, given backend returns no tx history', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn().mockReturnValue(false),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockRuleBasedOwnershipAddressInfos.find((info) => info.path === path)!.pubkey,
    });
    const mockAddressStorage = new RuleBasedAddressStorage(mockBackend, mockKeystoreService);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOffChainExternalAddresses()).toEqual(
      [...mockRuleBasedOwnershipAddressInfos].slice(0, 50),
    );
  });

  it('should return 50 off chain locks with index 1~51 when calling getOffChainLocks, given backend returns one tx history of fisrt address', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn(({ lock }) => {
        if (lock.args === mockRuleBasedOwnershipAddressInfos[0].lock.args) return Promise.resolve(true);
        return Promise.resolve(false);
      }),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockRuleBasedOwnershipAddressInfos.find((info) => info.path === path)!.pubkey,
    });
    const mockAddressStorage = new RuleBasedAddressStorage(mockBackend, mockKeystoreService);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getAllOffChainAddresses()).toEqual(
      [...mockRuleBasedOwnershipAddressInfos].slice(1, 51),
    );
  });
});

describe('full ownership addressStorage', () => {
  it('sync address success when backend returns one hasTxHistory', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn().mockReturnValueOnce(true).mockReturnValue(false),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: () => mockFullOwnershipAddressInfos[0].pubkey,
    });
    const mockAddressStorage = new FullOwnershipAddressStorage(mockBackend, mockKeystoreService);
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([]);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([mockFullOwnershipAddressInfos[0]]);
  });

  it('sync address success when backend resolves 1st and 3rd lock has tx history', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn(({ lock }) => {
        if (lock.args === mockFullOwnershipAddressInfos[0].lock.args) return Promise.resolve(true); // m/44'/309'/0'/0/0
        if (lock.args === mockFullOwnershipAddressInfos[2].lock.args) return Promise.resolve(true); // m/44'/309'/0'/0/2
        return Promise.resolve(false);
      }),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockFullOwnershipAddressInfos.find((info) => info.path === path)!.pubkey,
    });
    const mockAddressStorage = new FullOwnershipAddressStorage(mockBackend, mockKeystoreService);
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([]);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOnChainExternalAddresses()).toEqual([
      mockFullOwnershipAddressInfos[0],
      mockFullOwnershipAddressInfos[2],
    ]);
  });

  it('should return 20 off chain locks with index 1~21 when calling getOffChainLocks, given backend returns one tx history of fisrt address', async () => {
    const mockBackend: Backend = createMockBackend({
      hasHistory: jest.fn(({ lock }) => {
        if (lock.args === mockFullOwnershipAddressInfos[0].lock.args) return Promise.resolve(true);
        return Promise.resolve(false);
      }),
    });
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockFullOwnershipAddressInfos.find((info) => info.path === path)!.pubkey,
    });
    const mockAddressStorage = new FullOwnershipAddressStorage(mockBackend, mockKeystoreService);
    await mockAddressStorage.syncAllAddressInfo();
    expect(await mockAddressStorage.getOffChainExternalAddresses()).toEqual(mockFullOwnershipAddressInfos.slice(1, 21));
    expect(await mockAddressStorage.getOffChainChangeAddresses()).toEqual(
      mockFullOwnershipAddressInfos.slice(101, 121),
    );
  });
});
