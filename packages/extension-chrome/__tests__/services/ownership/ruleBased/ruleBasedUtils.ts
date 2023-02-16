import { isRuleBasedOwnership } from '../../../../src/services/ownership/ruleBased/utils';

describe('rule_based_utils', () => {
  it('should judge if a lockInfo is rule base hd path', () => {
    expect(
      isRuleBasedOwnership({
        path: "m/4410179'/0'",
      }),
    ).toEqual(true);
    expect(
      isRuleBasedOwnership({
        path: "m/44'/309'/0'/1",
      }),
    ).toEqual(false);
  });
});
