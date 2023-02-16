import { LockInfoStorage, RuleBasedLocksAndPointer } from '../types';
import { Storage } from '@nexus-wallet/types';

export const RULE_BASED_HARDENED_PATH = "m/4410179'/0'";

export function getDefaultRuleBasedLocksAndPointer(): RuleBasedLocksAndPointer {
  return {
    lockInfos: [],
    pointer: null,
  };
}

export async function getRuleBasedStorageData(payload: {
  storage: Storage<LockInfoStorage>;
}): Promise<RuleBasedLocksAndPointer> {
  const defaultValue: RuleBasedLocksAndPointer = getDefaultRuleBasedLocksAndPointer();
  const cachedLocks = await payload.storage.getItem('ruleBased');
  if (cachedLocks) {
    return cachedLocks;
  }
  return defaultValue;
}

export function isRuleBasedOwnership(payload: { path: string }): boolean {
  return payload.path.startsWith(RULE_BASED_HARDENED_PATH);
}

export function maxRuleBasedLockIndex(payload: { locksAndPointer: RuleBasedLocksAndPointer }): number {
  const lockInfos = payload.locksAndPointer.lockInfos;
  let result = -1;
  lockInfos.forEach((lockInfo) => {
    if (lockInfo.index > result) {
      result = lockInfo.index;
    }
  });
  return result;
}
