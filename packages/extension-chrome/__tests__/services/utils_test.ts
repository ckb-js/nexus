import { isExternalParentPath } from '../../src/services/backend/utils';
import { generateLocksAndPointers } from './utils';

describe('utils', () => {
  it('should generate lock details with 80 onchain locks and 20 offchain locks', () => {
    const locks = generateLocksAndPointers({ fullOwnership: true });
    expect(locks.details.onChain.external.length).toEqual(80);
    expect(locks.details.offChain.external.length).toEqual(20);
    expect(locks.details.onChain.change.length).toEqual(80);
    expect(locks.details.offChain.change.length).toEqual(20);

    const rbLocks = generateLocksAndPointers({ fullOwnership: false });
    expect(rbLocks.details.onChain.external.length).toEqual(80);
    expect(rbLocks.details.offChain.external.length).toEqual(20);
    expect(rbLocks.details.onChain.change.length).toEqual(0);
    expect(rbLocks.details.offChain.change.length).toEqual(0);
  });
  it('should judge if a lockInfo is eternal lock by path', () => {
    expect(
      isExternalParentPath({
        parentPath: "m/4410179'/0'",
      }),
    ).toEqual(true);
    expect(isExternalParentPath({ parentPath: "m/44'/309'/0'/1" })).toEqual(false);
  });
});
