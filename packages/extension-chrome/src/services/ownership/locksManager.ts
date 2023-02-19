import { bytes } from '@ckb-lumos/codec';
import { Script } from '@ckb-lumos/base';
import { Storage } from '@nexus-wallet/types';
import { CircularOffChainLockInfo } from './circular';
import { OnChainLockProvider, DefaultOnChainLockProvider } from './onchainLockProvider';
import { LockInfoStorage, LockInfo } from './types';
import { getFullStorageData } from './full/utils';
import { getRuleBasedStorageData } from './ruleBased/utils';
import { offChainFilter, onChainFilter, updateOffChainLockInfos } from './utils';

export class LocksManager {
  storage: Storage<LockInfoStorage>;

  constructor(payload: { storage: Storage<LockInfoStorage> }) {
    this.storage = payload.storage;
  }

  // offchain circular lock providers
  async fullExternalProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await getFullStorageData({ storage: this.storage });
    const storageUpdator = async (items: LockInfo[]) => {
      locks.lockInfos.external = updateOffChainLockInfos({
        offChainLockInfos: items,
        allLockInfos: locks.lockInfos.external,
      });
      await this.storage.setItem('full', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointers.external = pointer;
      await this.storage.setItem('full', locks);
    };
    return new CircularOffChainLockInfo({
      items: offChainFilter({ lockInfos: locks.lockInfos.external }),
      pointer: locks.pointers.external,
      storageUpdator,
      pointerUpdator,
    });
  }
  async fullChangeProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await getFullStorageData({ storage: this.storage });
    const storageUpdator = async (items: LockInfo[]) => {
      locks.lockInfos.change = updateOffChainLockInfos({
        offChainLockInfos: items,
        allLockInfos: locks.lockInfos.change,
      });
      await this.storage.setItem('full', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointers.change = pointer;
      await this.storage.setItem('full', locks);
    };
    return new CircularOffChainLockInfo({
      items: offChainFilter({ lockInfos: locks.lockInfos.change }),
      pointer: locks.pointers.change,
      storageUpdator,
      pointerUpdator,
    });
  }
  async ruleBasedProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await getRuleBasedStorageData({ storage: this.storage });
    const storageUpdator = async (items: LockInfo[]) => {
      locks.lockInfos = updateOffChainLockInfos({
        offChainLockInfos: items,
        allLockInfos: locks.lockInfos,
      });
      await this.storage.setItem('ruleBased', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointer = pointer;
      await this.storage.setItem('ruleBased', locks);
    };
    return new CircularOffChainLockInfo({
      items: offChainFilter({ lockInfos: locks.lockInfos }),
      pointer: locks.pointer,
      storageUpdator,
      pointerUpdator,
    });
  }

  async fullOnChainLockProvider(): Promise<OnChainLockProvider> {
    const lockInfos = (await getFullStorageData({ storage: this.storage })).lockInfos;
    return new DefaultOnChainLockProvider({
      items: onChainFilter({ lockInfos: [...lockInfos.external, ...lockInfos.change] }),
    });
  }

  async ruleBasedOnChainLockProvider(): Promise<OnChainLockProvider> {
    const lockInfos = (await getRuleBasedStorageData({ storage: this.storage })).lockInfos;
    return new DefaultOnChainLockProvider({
      items: onChainFilter({ lockInfos }),
    });
  }

  async getlockInfoByLock({ lock }: { lock: Script }): Promise<LockInfo | undefined> {
    const full = await getFullStorageData({ storage: this.storage });
    const rb = await getRuleBasedStorageData({ storage: this.storage });
    const allLockInfo: LockInfo[] = [...full.lockInfos.external, ...full.lockInfos.change, ...rb.lockInfos];
    const result = allLockInfo.find((lockInfo) => {
      return bytes.equal(lockInfo.lock.args, lock.args) && bytes.equal(lockInfo.lock.codeHash, lock.codeHash);
    });
    return result;
  }
}
