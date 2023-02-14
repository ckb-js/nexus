import { LockInfo } from './types';
import { LockCursor } from './cursor';
import { LinkedList } from './linkedList';
import { OwnershipFilter } from '@nexus-wallet/types/lib/services/OwnershipService';
import { isExternalParentPath } from './utils';

type LockInfoWithCursor = {
  lockInfo: LockInfo;
  cursor: LockCursor;
};

export interface OnChainLockProvider {
  items: LinkedList<LockInfo>;
  getNextLock(payload: { cursor?: LockCursor; filter?: OwnershipFilter }): LockInfoWithCursor | undefined;
}

export class DefaultOnChainLockProvider implements OnChainLockProvider {
  items: LinkedList<LockInfo>;

  constructor(payload: { items: LockInfo[] }) {
    this.items = new LinkedList<LockInfo>(payload.items);
  }

  getNextLock(payload: { cursor?: LockCursor; filter?: OwnershipFilter }): LockInfoWithCursor | undefined {
    const result = this.items.search(
      (data) => data.onchain && cursorComparator(data, payload.cursor) && filterComparator(data, payload.filter),
    )?.data;
    return result ? { lockInfo: result, cursor: { index: result.index, parentPath: result.parentPath } } : undefined;
  }
}
/**
 * decides whether the lockInfo is after the cursor
 * @param lockInfo
 * @param cursor
 */
function cursorComparator(lockInfo: LockInfo, cursor?: LockCursor): boolean {
  if (!cursor) return true;
  return lockInfo.index > cursor!.index && lockInfo.parentPath >= cursor!.parentPath;
}
/**
 * decides whether the lockInfo fits the filter
 * @param lockInfo
 * @param filter
 */
function filterComparator(lockInfo: LockInfo, filter?: OwnershipFilter): boolean {
  if (!filter) return true;
  return filter.change === 'external'
    ? isExternalParentPath({ parentPath: lockInfo.parentPath })
    : !isExternalParentPath({ parentPath: lockInfo.parentPath });
}
