import { isExternal } from '../../../../src/services/ownership/full/utils';
import { offChain, onChain } from '../../../../src/services/ownership/utils';
import { generateFullLocksAndPointers, generateRuleBasedLocksAndPointers } from '../common/utils';

describe('full_ownership_utils', () => {
  it('should generate lock details with 80 onchain locks and 20 offchain locks', () => {
    const locks = generateFullLocksAndPointers();
    expect(onChain({ lockInfos: locks.lockInfos.external }).length).toEqual(80);
    expect(offChain({ lockInfos: locks.lockInfos.external }).length).toEqual(20);
    expect(onChain({ lockInfos: locks.lockInfos.change }).length).toEqual(80);
    expect(offChain({ lockInfos: locks.lockInfos.change }).length).toEqual(20);

    const rbLocks = generateRuleBasedLocksAndPointers();
    expect(onChain({ lockInfos: rbLocks.lockInfos }).length).toEqual(80);
    expect(offChain({ lockInfos: rbLocks.lockInfos }).length).toEqual(20);
  });

  it('should judge if a lockInfo is eternal lock by path', () => {
    expect(
      isExternal({
        path: "m/44'/309'/0'/0",
      }),
    ).toEqual(true);
    expect(
      isExternal({
        path: "m/44'/309'/0'/1",
      }),
    ).toEqual(false);
  });
});
