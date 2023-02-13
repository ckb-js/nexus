import { mockFullOwnershipLockInfosExternal } from './utils';
import { LocksManager } from '../../src/services/backend/locksManager';
import { getDefaultLocksAndPointer } from '../../src/services/backend/utils';

describe('locksManager', () => {
  it('should return default value when lockDetails are empty', async () => {
    const lockDetail = getDefaultLocksAndPointer();
    const locksManager = new LocksManager({ lockDetail });

    expect(locksManager.toLocksAndPointer()).toEqual(lockDetail);
    expect(locksManager.currentMaxExternalAddressIndex()).toEqual(-1);
    expect(locksManager.getNextOffChainExternalLocks()).toEqual([]);
    expect(locksManager.getNextOffChainChangeLocks()).toEqual([]);
    expect(locksManager.getNextOnChainExternalLocks()).toEqual([]);
    expect(locksManager.getNextOnChainChangeLocks()).toEqual([]);

    expect(
      locksManager.getlockInfoByLock({
        lock: {
          codeHash: '',
          hashType: 'type' as const,
          args: '',
        },
      }),
    ).toEqual(undefined);

    expect(locksManager.getAllOnChainLockList()).toEqual([]);
    expect(locksManager.getAllOffChainAddresses()).toEqual([]);

    locksManager.offChain.external = [mockFullOwnershipLockInfosExternal[0]];
    locksManager.markAddressAsUsed({ lockInfoList: [mockFullOwnershipLockInfosExternal[0]] });
    expect(locksManager.getAllOnChainLockList()).toEqual([mockFullOwnershipLockInfosExternal[0]]);
  });
});
