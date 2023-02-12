import { LocksProvider } from '../../src/services/backend/locksProvider';
import { Backend } from '../../src/services/backend/backend';
import {
  createMockBackend,
  createMockKeystoreService,
  generateLocksAndPointers,
  mockFullOwnershipLockInfos,
} from './utils';

describe('fullOwnership', () => {
  it('LocksProvider#should get circular locks when squencially call getNextLock', async () => {
    const mockBackend: Backend = createMockBackend({});
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
    });
    const locksAndPointer = generateLocksAndPointers({ fullOwnership: true });
    const mockLocksProvider = new LocksProvider({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      lockDetail: locksAndPointer,
    });

    for (let index = 0; index < 100; index++) {
      // offchain locks go circular with length of 20
      expect(await mockLocksProvider.getNextOffChainExternalLocks()).toEqual([
        locksAndPointer.details.offChain.external[index % 20],
      ]);
      expect(await mockLocksProvider.getNextOffChainChangeLocks()).toEqual([
        locksAndPointer.details.offChain.change[index % 20],
      ]);

      // onchain locks go circular with length of 80
      expect(await mockLocksProvider.getNextOnChainExternalLocks()).toEqual([
        locksAndPointer.details.onChain.external[index % 80],
      ]);
      expect(await mockLocksProvider.getNextOnChainChangeLocks()).toEqual([
        locksAndPointer.details.onChain.change[index % 80],
      ]);
    }
  });
});

describe('ruleBasedOwnership', () => {
  it('LocksProvider#should get circular locks when squencially call getNextLock', async () => {
    const mockBackend: Backend = createMockBackend({});
    const mockKeystoreService = createMockKeystoreService({
      getPublicKeyByPath: ({ path }) => mockFullOwnershipLockInfos.find((info) => info.path === path)!.publicKey,
    });
    const locksAndPointer = generateLocksAndPointers({ fullOwnership: false });
    const mockLocksProvider = new LocksProvider({
      backend: mockBackend,
      keystoreService: mockKeystoreService,
      lockDetail: locksAndPointer,
    });

    for (let index = 0; index < 100; index++) {
      // offchain locks go circular with length of 20
      expect(await mockLocksProvider.getNextOffChainExternalLocks()).toEqual([
        locksAndPointer.details.offChain.external[index % 20],
      ]);
      expect(await mockLocksProvider.getNextOffChainChangeLocks()).toEqual([]);

      // onchain locks go circular with length of 80
      expect(await mockLocksProvider.getNextOnChainExternalLocks()).toEqual([
        locksAndPointer.details.onChain.external[index % 80],
      ]);
      expect(await mockLocksProvider.getNextOnChainChangeLocks()).toEqual([]);
    }
  });
});
