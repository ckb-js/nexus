import { LockInfo } from './types';
import { LockCursor } from './cursor';
import { LinkedList } from './linkedList';
import { OwnershipFilter } from '@nexus-wallet/types/lib/services/OwnershipService';
import { isExternal } from './utils';

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
      (data) => cursorComparator(data, payload.cursor) && filterComparator(data, payload.filter),
    )?.data;
    return result ? { lockInfo: result, cursor: { index: result.index, parentPath: result.parentPath } } : undefined;
  }
}

function cursorComparator(lockInfo: LockInfo, cursor?: LockCursor): boolean {
  if (!cursor) return true;
  return lockInfo.index > cursor!.index && lockInfo.parentPath >= cursor!.parentPath;
}
function filterComparator(lockInfo: LockInfo, filter?: OwnershipFilter): boolean {
  if (!filter) return true;
  return filter.change === 'external' ? isExternal({ lockInfo }) : !isExternal({ lockInfo });
}
