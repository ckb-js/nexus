import { bytes } from '@ckb-lumos/codec';
import { Script } from '@ckb-lumos/base';
import { Storage } from '@nexus-wallet/types';
import { getAddressInfoDetailsFromStorage as loadLocksInfoFromStorage } from './utils';
import { CircularOffChainLockInfo } from './circular';
import { OnChainLockProvider, DefaultOnChainLockProvider } from './onchainLockProvider';
import { LockInfoStorage, LocksAndPointer, LockInfo } from './types';

export class LocksManager {
  storage: Storage<LockInfoStorage>;

  constructor(payload: { storage: Storage<LockInfoStorage> }) {
    this.storage = payload.storage;
  }

  // offchain circular lock providers
  async fullExternalProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await this.loadLocksAndPointer('fullOwnership');
    const storageUpdator = async (items: LockInfo[]) => {
      locks.details.offChain.external = items;
      await this.storage.setItem('fullOwnership', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointers.offChain.external = pointer;
      await this.storage.setItem('fullOwnership', locks);
    };
    return new CircularOffChainLockInfo({
      items: locks.details.offChain.external,
      pointer: locks.pointers.offChain.external,
      storageUpdator,
      pointerUpdator,
    });
  }
  async fullChangeProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await this.loadLocksAndPointer('fullOwnership');
    const storageUpdator = async (items: LockInfo[]) => {
      locks.details.offChain.change = items;
      await this.storage.setItem('fullOwnership', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointers.offChain.change = pointer;
      await this.storage.setItem('fullOwnership', locks);
    };
    return new CircularOffChainLockInfo({
      items: locks.details.offChain.change,
      pointer: locks.pointers.offChain.change,
      storageUpdator,
      pointerUpdator,
    });
  }
  async ruleBasedProvider(): Promise<CircularOffChainLockInfo> {
    const locks = await this.loadLocksAndPointer('ruleBasedOwnership');
    const storageUpdator = async (items: LockInfo[]) => {
      locks.details.offChain.external = items;
      await this.storage.setItem('ruleBasedOwnership', locks);
    };
    const pointerUpdator = async (pointer: LockInfo | null) => {
      locks.pointers.offChain.external = pointer;
      await this.storage.setItem('ruleBasedOwnership', locks);
    };
    return new CircularOffChainLockInfo({
      items: locks.details.offChain.external,
      pointer: locks.pointers.offChain.external,
      storageUpdator,
      pointerUpdator,
    });
  }

  async fullOnChainLockProvider(): Promise<OnChainLockProvider> {
    const onChain = (await this.loadLocksAndPointer('fullOwnership')).details.onChain;
    return new DefaultOnChainLockProvider({
      items: [...onChain.external, ...onChain.change],
    });
  }

  async ruleBasedOnChainLockProvider(): Promise<OnChainLockProvider> {
    const onChain = (await this.loadLocksAndPointer('ruleBasedOwnership')).details.onChain;
    return new DefaultOnChainLockProvider({
      items: onChain.external,
    });
  }

  async loadLocksAndPointer(keyName: keyof LockInfoStorage): Promise<LocksAndPointer> {
    return loadLocksInfoFromStorage({ storage: this.storage, keyName });
  }

  async getlockInfoByLock({ lock }: { lock: Script }): Promise<LockInfo | undefined> {
    const full = await this.loadLocksAndPointer('fullOwnership');
    const rb = await this.loadLocksAndPointer('ruleBasedOwnership');
    const allLockInfo: LockInfo[] = [
      ...full.details.onChain.external,
      ...full.details.onChain.change,
      ...full.details.offChain.external,
      ...full.details.offChain.change,
      ...rb.details.onChain.external,
      ...rb.details.offChain.external,
    ];
    const result = allLockInfo.find((lockInfo) => {
      return bytes.equal(lockInfo.lock.args, lock.args) && bytes.equal(lockInfo.lock.codeHash, lock.codeHash);
    });
    return result;
  }
}
