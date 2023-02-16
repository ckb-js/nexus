import { Storage } from '@nexus-wallet/types';
import { LockInfoStorage, FullLocksAndPointer } from '../types';

export const FULL_HARDENED_PATH = "m/44'/309'/0'";
export const FULL_EXTERNAL_PARENT_PATH = "m/44'/309'/0'/0";
export const FULL_CHANGE_PARENT_PATH = "m/44'/309'/0'/1";

export function getDefaultFullLocksAndPointer(): FullLocksAndPointer {
  return {
    lockInfos: {
      external: [],
      change: [],
    },
    pointers: {
      external: null,
      change: null,
    },
  };
}

export async function getFullStorageData(payload: { storage: Storage<LockInfoStorage> }): Promise<FullLocksAndPointer> {
  const defaultValue: FullLocksAndPointer = getDefaultFullLocksAndPointer();
  const cachedLocks = await payload.storage.getItem('full');
  if (cachedLocks) {
    return cachedLocks;
  }
  return defaultValue;
}

export function isFullOwnership(payload: { path: string }): boolean {
  return payload.path.startsWith(FULL_HARDENED_PATH);
}

export function isExternal(payload: { path: string }): boolean {
  return payload.path.startsWith(`${FULL_HARDENED_PATH}/0`);
}

export function maxExternalLockIndex(payload: { locksAndPointer: FullLocksAndPointer }): number {
  const lockInfos = payload.locksAndPointer.lockInfos;
  let result = -1;
  lockInfos.external.forEach((lockInfo) => {
    if (lockInfo.index > result) {
      result = lockInfo.index;
    }
  });
  return result;
}

export function maxChangeLockIndex(payload: { locksAndPointer: FullLocksAndPointer }): number {
  const lockInfos = payload.locksAndPointer.lockInfos;
  let result = -1;
  lockInfos.change.forEach((lockInfo) => {
    if (lockInfo.index > result) {
      result = lockInfo.index;
    }
  });
  return result;
}
