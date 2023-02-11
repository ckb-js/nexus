import { bytes } from '@ckb-lumos/codec';
import { Hash, Script } from '@ckb-lumos/base';
import min from 'lodash/min';
import max from 'lodash/max';

export const MAX_ADDRESS_GAP = 20;
export const RULE_BASED_MAX_ADDRESS_GAP = 50;

export type StorageSchema = {
  fullOwnershipAddressInfo: string;
  ruleBasedOwnershipAddressInfo: string;
};

export type LockInfo = {
  path: string;
  index: number;
  depth?: number;
  pubkey: string;
  blake160: string;
  lock: Script;
  lockHash: Hash;
};

export type NexusLockInfos = {
  onChainAddresses: {
    externalAddresses: LockInfo[];
    changeAddresses: LockInfo[];
  };
  offChainAddresses: {
    externalAddresses: LockInfo[];
    changeAddresses: LockInfo[];
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
  onChainAddresses: {
    externalAddresses: LockInfo[];
    changeAddresses: LockInfo[];
  };
  offChainAddresses: {
    externalAddresses: LockInfo[];
    changeAddresses: LockInfo[];
  };
  constructor(payload: { lockDetail: LocksAndPointer }) {
    this.onChainAddresses = payload.lockDetail.details.onChainAddresses;
    this.offChainAddresses = payload.lockDetail.details.offChainAddresses;
    this.pointers = payload.lockDetail.pointers;
  }
  toJSONString(): string {
    return JSON.stringify({
      onChainAddresses: this.onChainAddresses,
      offChainAddresses: this.offChainAddresses,
    });
  }
  currentMaxExternalAddressIndex(): number {
    let result = -1;
    [...this.onChainAddresses.externalAddresses, ...this.offChainAddresses.externalAddresses].forEach((address) => {
      if (address.index > result) {
        result = address.index;
      }
    });
    return result;
  }
  currentMaxChangeAddressIndex(): number {
    let result = -1;
    [...this.onChainAddresses.changeAddresses, ...this.offChainAddresses.changeAddresses].forEach((address) => {
      if (address.index > result) {
        result = address.index;
      }
    });
    return result;
  }

  getNextOffChainExternalLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.offChainAddresses.externalAddresses;
    const result = nextLockInfos(lockInfos, this.pointers.offChain.external, option.limit);
    // update pointer
    this.pointers.offChain.external = result[result.length - 1].index;
    return result;
  }

  getNextOffChainChangeLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.offChainAddresses.changeAddresses;
    const result = nextLockInfos(lockInfos, this.pointers.offChain.change, option.limit);
    // update pointer
    this.pointers.offChain.change = result[result.length - 1].index;
    return result;
  }

  getNextOnChainExternalLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.onChainAddresses.externalAddresses;
    const result = nextLockInfos(lockInfos, this.pointers.onChain.external, option.limit);
    // update pointer
    this.pointers.onChain.external = result[result.length - 1].index;
    return result;
  }

  getNextOnChainChangeLocks(option = { limit: 1 }): LockInfo[] {
    const lockInfos = this.onChainAddresses.changeAddresses;
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
        const needUpdate = !this.onChainAddresses.externalAddresses.some(
          (onChainAddress) => onChainAddress.path === address.path,
        );
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChainAddresses.externalAddresses.push(address);
          // remove from cached off chain addresses
          this.offChainAddresses.externalAddresses = this.offChainAddresses.externalAddresses.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      } else {
        const needUpdate = !this.onChainAddresses.changeAddresses.some(
          (onChainAddress) => onChainAddress.path === address.path,
        );
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChainAddresses.changeAddresses.push(address);
          // remove from cached off chain addresses
          this.offChainAddresses.changeAddresses = this.offChainAddresses.changeAddresses.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      }
    });
  }

  getAddressInfoByLock(payload: { lock: Script }): LockInfo | undefined {
    const lock = payload.lock;
    return (
      this.onChainAddresses.externalAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.onChainAddresses.changeAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.offChainAddresses.externalAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.offChainAddresses.changeAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      )
    );
  }
  getOnChainExternalAddresses(): LockInfo[] {
    return this.onChainAddresses.externalAddresses;
  }
  setOnChainExternalAddresses(addresses: LockInfo[]): void {
    this.onChainAddresses.externalAddresses = addresses;
  }
  getOnChainChangeAddresses(): LockInfo[] {
    return this.onChainAddresses.changeAddresses;
  }
  setOnChainChangeAddresses(addresses: LockInfo[]): void {
    this.onChainAddresses.changeAddresses = addresses;
  }
  getAllOnChainLockList(): LockInfo[] {
    return [...this.onChainAddresses.externalAddresses, ...this.onChainAddresses.changeAddresses];
  }
  getOffChainExternalAddresses(): LockInfo[] {
    return this.offChainAddresses.externalAddresses;
  }
  setOffChainExternalAddresses(addresses: LockInfo[]): void {
    this.offChainAddresses.externalAddresses = addresses;
  }
  getOffChainChangeAddresses(): LockInfo[] {
    return this.offChainAddresses.changeAddresses;
  }
  setOffChainChangeAddresses(addresses: LockInfo[]): void {
    this.offChainAddresses.changeAddresses = addresses;
  }
  getAllOffChainAddresses(): LockInfo[] {
    return [...this.offChainAddresses.externalAddresses, ...this.offChainAddresses.changeAddresses];
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
  if (pointer < minIndex || pointer > maxIndex) {
    return [lockInfos[0]];
  } else {
    while (indexList[0] <= pointer) {
      // move first element to last until firts element is bigger than pointer
      const lastElement = indexList.shift()!;
      indexList.push(lastElement);
    }
    const returnIndexlist = indexList.slice(0, limit);
    return lockInfos.filter((lockInfo) => returnIndexlist.includes(lockInfo.index));
  }
}
