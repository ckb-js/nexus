import { bytes } from '@ckb-lumos/codec';
import { Backend } from './backend';
import { KeystoreService } from '@nexus-wallet/types';
import { LocksAndPointer, LocksManager, LockInfo } from './locksManager';
import { Script } from '@ckb-lumos/base';

export class LocksProvider {
  locksManager: LocksManager;
  keystoreService: KeystoreService;
  backend: Backend;

  constructor(config: { lockDetail: LocksAndPointer; keystoreService: KeystoreService; backend: Backend }) {
    this.locksManager = new LocksManager({ lockDetail: config.lockDetail });
    this.backend = config.backend;
    this.keystoreService = config.keystoreService;
  }

  getAllOnChainLockList(): LockInfo[] {
    return this.locksManager.getAllOnChainLockList();
  }

  async getNextOffChainExternalLocks(): Promise<LockInfo[]> {
    // TODO assume getNextOffChainExternalLocks return only one lock for now
    const lockInfo = this.locksManager.getNextOffChainExternalLocks()[0];
    if (await this.backend.hasHistory({ lock: lockInfo.lock })) {
      this.locksManager.markAddressAsUsed({ lockInfoList: [lockInfo] });
      return this.getNextOffChainExternalLocks();
    }
    return [lockInfo];
  }
  async getNextOffChainChangeLocks(): Promise<LockInfo[]> {
    // TODO assume getNextOffChainExternalLocks return only one lock for now
    const lockInfo = this.locksManager.getNextOffChainChangeLocks()[0];
    if (await this.backend.hasHistory({ lock: lockInfo.lock })) {
      this.locksManager.markAddressAsUsed({ lockInfoList: [lockInfo] });
      return this.getNextOffChainChangeLocks();
    }
    return [lockInfo];
  }
  getNextOnChainExternalLocks(): LockInfo[] {
    return this.locksManager.getNextOnChainExternalLocks();
  }
  getNextOnChainChangeLocks(): LockInfo[] {
    return this.locksManager.getNextOnChainChangeLocks();
  }
  getOnChainExternalAddresses(): LockInfo[] {
    return this.locksManager.getNextOnChainExternalLocks();
  }
  getOnChainChangeAddresses(): LockInfo[] {
    return this.locksManager.getNextOnChainChangeLocks();
  }
  getlockInfoByLock({ lock }: { lock: Script }): LockInfo | undefined {
    const allLockInfo = [
      ...this.locksManager.onChainAddresses.externalAddresses,
      ...this.locksManager.onChainAddresses.changeAddresses,
      ...this.locksManager.offChainAddresses.externalAddresses,
      ...this.locksManager.offChainAddresses.changeAddresses,
    ];
    return allLockInfo.find((lockInfo) => {
      return bytes.equal(lockInfo.lock.args, lock.args) && bytes.equal(lockInfo.lock.codeHash, lock.codeHash);
    });
  }
}
