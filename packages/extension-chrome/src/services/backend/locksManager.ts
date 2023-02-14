import { asserts } from '@nexus-wallet/utils';
import { bytes } from '@ckb-lumos/codec';
import { Script } from '@ckb-lumos/base';
import { Storage } from '@nexus-wallet/types';
import { getAddressInfoDetailsFromStorage as loadLocksInfoFromStorage } from './utils';
import { LockInfoStorage, LocksAndPointer, LockInfo } from './types';
import { Circular, CircularLockInfo } from './circular';
import { DefaultOnChainLockProvider, OnChainLockProvider } from './onchainLockProvider';

export class LocksManager {
  storage: Storage<LockInfoStorage>;

  constructor(payload: { storage: Storage<LockInfoStorage> }) {
    this.storage = payload.storage;
  }

  async fullExternalProvider(): Promise<Circular<LockInfo>> {
    const locks = await this.loadLocksAndPointer('fullOwnership');
    return new CircularLockInfo({
      items: locks.details.offChain.external,
      pointer: locks.pointers.offChain.external,
    });
  }
  async fullChangeProvider(): Promise<Circular<LockInfo>> {
    const locks = await this.loadLocksAndPointer('fullOwnership');
    return new CircularLockInfo({
      items: locks.details.offChain.change,
      pointer: locks.pointers.offChain.change,
    });
  }
  async ruleBasedProvider(): Promise<Circular<LockInfo>> {
    const locks = await this.loadLocksAndPointer('ruleBasedOwnership');
    return new CircularLockInfo({
      items: locks.details.offChain.external,
      pointer: locks.pointers.offChain.external,
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

  async getlockInfoByLock({ lock }: { lock: Script }): Promise<LockInfo> {
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
    asserts.nonEmpty(result);
    return result;
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
}
