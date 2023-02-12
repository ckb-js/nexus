import { Network } from './../../../../types/src/injected';
import { bytes } from '@ckb-lumos/codec';
import { Hash, Script } from '@ckb-lumos/base';
import min from 'lodash/min';
import max from 'lodash/max';

export const MAX_ADDRESS_GAP = 20;
export const RULE_BASED_MAX_ADDRESS_GAP = 50;

export type StorageSchema = {
  fullOwnership: string;
  ruleBasedOwnership: string;
};

export type LockInfo = {
  // hd wallet path
  path: string;
  // the BIP44's {@link https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#index index}
  index: number;
  depth?: number;
  pubkey: string;
  blake160: string;
  network: Network;
  lock: Script;
  lockHash: Hash;
};

export type NexusLockInfos = {
  onChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
  offChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
};

export type NexusLockPointers = {
  onChain: {
    external: number;
    change: number;
  };
  offChain: {
    external: number;
    change: number;
  };
};

export type LocksAndPointer = {
  details: NexusLockInfos;
  pointers: NexusLockPointers;
};

export class LocksManager {
  pointers: NexusLockPointers;
  onChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
  offChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
  constructor(payload: { lockDetail: LocksAndPointer }) {
    this.onChain = payload.lockDetail.details.onChain;
    this.offChain = payload.lockDetail.details.offChain;
    this.pointers = payload.lockDetail.pointers;
  }
  toJSONString(): string {
    return JSON.stringify({
      onChainAddresses: this.onChain,
      offChainAddresses: this.offChain,
    });
  }
  currentMaxExternalAddressIndex(): number {
    let result = -1;
    [...this.onChain.external, ...this.offChain.external].forEach((address) => {
      if (address.index > result) {
        result = address.index;
      }
    });
    return result;
  }
  currentMaxChangeAddressIndex(): number {
    let result = -1;
    [...this.onChain.change, ...this.offChain.change].forEach((address) => {
      if (address.index > result) {
        result = address.index;
      }
    });
    return result;
  }

  getNextOffChainExternalLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.offChain.external;
    if (lockInfos.length === 0) {
      return [];
    }
    const result = nextLockInfos(lockInfos, this.pointers.offChain.external, option.limit);
    // update pointer
    this.pointers.offChain.external = result[result.length - 1].index;
    return result;
  }

  getNextOffChainChangeLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.offChain.change;
    if (lockInfos.length === 0) {
      return [];
    }
    const result = nextLockInfos(lockInfos, this.pointers.offChain.change, option.limit);
    // update pointer
    this.pointers.offChain.change = result[result.length - 1].index;
    return result;
  }

  getNextOnChainExternalLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.onChain.external;
    if (lockInfos.length === 0) {
      return [];
    }
    const result = nextLockInfos(lockInfos, this.pointers.onChain.external, option.limit);
    // update pointer
    this.pointers.onChain.external = result[result.length - 1].index;
    return result;
  }

  getNextOnChainChangeLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.onChain.change;
    if (lockInfos.length === 0) {
      return [];
    }
    const result = nextLockInfos(lockInfos, this.pointers.onChain.change, option.limit);
    // update pointer
    this.pointers.onChain.change = result[result.length - 1].index;
    return result;
  }

  isExternalAddress(payload: { addressInfo: LockInfo }): boolean {
    const pathList = payload.addressInfo.path.split('/');
    const isChange = pathList[pathList.length - 2] === '1';
    return isChange;
  }

  markAddressAsUsed(payload: { lockInfoList: LockInfo[] }): void {
    payload.lockInfoList.forEach((address) => {
      const isExternalAddress = this.isExternalAddress({ addressInfo: address });
      if (isExternalAddress) {
        const needUpdate = !this.onChain.external.some((onChainAddress) => onChainAddress.path === address.path);
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChain.external.push(address);
          // remove from cached off chain addresses
          this.offChain.external = this.offChain.external.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      } else {
        const needUpdate = !this.onChain.change.some((onChainAddress) => onChainAddress.path === address.path);
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChain.change.push(address);
          // remove from cached off chain addresses
          this.offChain.change = this.offChain.change.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      }
    });
  }

  getlockInfoByLock({ lock }: { lock: Script }): LockInfo | undefined {
    const allLockInfo = [
      ...this.onChain.external,
      ...this.onChain.change,
      ...this.offChain.external,
      ...this.offChain.change,
    ];
    return allLockInfo.find((lockInfo) => {
      return bytes.equal(lockInfo.lock.args, lock.args) && bytes.equal(lockInfo.lock.codeHash, lock.codeHash);
    });
  }

  getOnChainExternalAddresses(): LockInfo[] {
    return this.onChain.external;
  }
  setOnChainExternalAddresses(addresses: LockInfo[]): void {
    this.onChain.external = addresses;
  }
  getOnChainChangeAddresses(): LockInfo[] {
    return this.onChain.change;
  }
  setOnChainChangeAddresses(addresses: LockInfo[]): void {
    this.onChain.change = addresses;
  }
  getAllOnChainLockList(): LockInfo[] {
    return [...this.onChain.external, ...this.onChain.change];
  }
  getOffChainExternalAddresses(): LockInfo[] {
    return this.offChain.external;
  }
  setOffChainExternalAddresses(addresses: LockInfo[]): void {
    this.offChain.external = addresses;
  }
  getOffChainChangeAddresses(): LockInfo[] {
    return this.offChain.change;
  }
  setOffChainChangeAddresses(addresses: LockInfo[]): void {
    this.offChain.change = addresses;
  }
  getAllOffChainAddresses(): LockInfo[] {
    return [...this.offChain.external, ...this.offChain.change];
  }
}

/**
 * eg: if current indexList is [ 1, 2, 5, 6, 9 ]
 *                                    ↑
 *                           pointer: 3
 * then return [ 5, 6, 9, 1, 2 ]
 * default limit is 1, so return [ 5 ]
 */
function nextLockInfos(lockInfos: LockInfo[], pointer: number, limit: number): LockInfo[] {
  const indexList = lockInfos.map((lockInfo) => lockInfo.index);
  const minIndex = min(indexList) || 0;
  const maxIndex = max(indexList) || 0;
  if (pointer < minIndex || pointer >= maxIndex) {
    // not to change indexList here
  } else if (pointer === minIndex) {
    const lastElement = indexList.shift()!;
    indexList.push(lastElement);
  } else {
    while (indexList[0] <= pointer) {
      // move first element to last until firts element is bigger than pointer
      const lastElement = indexList.shift()!;
      indexList.push(lastElement);
    }
  }
  const returnIndexlist = indexList.slice(0, limit);
  return lockInfos.filter((lockInfo) => returnIndexlist.includes(lockInfo.index));
}
