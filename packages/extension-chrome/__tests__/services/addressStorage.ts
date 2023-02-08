import { FullOwnershipAddressStorage } from '../../src/services/backend/addressStorage';
import { Backend } from '../../src/services/backend/backend';
import { createMockBackend, createMockKeystoreService, mockAddressInfos } from './utils';

it('addressStorage#set and get unused addresses', async () => {
  const mockBackend: Backend = createMockBackend({});
  const mockKeystoreService = createMockKeystoreService({ getPublicKeyByPath: () => mockAddressInfos[0].pubkey });
  const mockAddressStorage = new FullOwnershipAddressStorage(mockBackend, mockKeystoreService);

  expect(await mockAddressStorage.getUnusedAddresses()).toEqual([]);
  mockAddressStorage.setUnusedAddresses([mockAddressInfos[0]]);
  expect(await mockAddressStorage.getUnusedAddresses()).toEqual([mockAddressInfos[0]]);
});
