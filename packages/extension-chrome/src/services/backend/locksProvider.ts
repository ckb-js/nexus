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
    const lockInfos = this.locksManager.getNextOffChainExternalLocks();
    if (lockInfos.length === 0) {
      return [];
    }
    // TODO assume getNextOffChainExternalLocks return only one lock for now
    const lockInfo = lockInfos[0];
    if (await this.backend.hasHistory({ lock: lockInfo.lock })) {
      this.locksManager.markAddressAsUsed({ lockInfoList: [lockInfo] });
      return this.getNextOffChainExternalLocks();
    }
    return [lockInfo];
  }
  async getNextOffChainChangeLocks(): Promise<LockInfo[]> {
    const lockInfos = this.locksManager.getNextOffChainChangeLocks();
    if (lockInfos.length === 0) {
      return [];
    }
    // TODO assume getNextOffChainExternalLocks return only one lock for now
    const lockInfo = lockInfos[0];
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
    return this.locksManager.getlockInfoByLock({ lock });
  }
}
