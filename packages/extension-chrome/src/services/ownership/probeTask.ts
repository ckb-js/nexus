import { Storage, KeystoreService } from '@nexus-wallet/types';
import { Backend } from './backend';
import { generateLockInfoByPath, offChainFilter, toSecp256k1Script } from './utils';
import { Script, utils } from '@ckb-lumos/base';
import { LockInfoStorage, FullLocksAndPointer, LockInfo, RuleBasedLocksAndPointer } from './types';
import {
  FULL_CHANGE_PARENT_PATH,
  FULL_EXTERNAL_PARENT_PATH,
  getFullStorageData,
  maxChangeLockIndex,
  maxExternalLockIndex,
} from './full/utils';
import { getRuleBasedStorageData, maxRuleBasedLockIndex, RULE_BASED_HARDENED_PATH } from './ruleBased/utils';

export const FULL_MAX_LOCK_GAP = 20;
export const RULE_BASED_MAX_LOCK_GAP = 50;

export class ProbeTask {
  private static instance: ProbeTask;
  private constructor(payload: {
    backend: Backend;
    storage: Storage<LockInfoStorage>;
    keystoreService: KeystoreService;
  }) {
    this.running = false;
    this.backend = payload.backend;
    this.storage = payload.storage;
    this.keystoreService = payload.keystoreService;
  }
  static getInstance({
    backend,
    storage,
    keystoreService,
  }: {
    backend: Backend;
    storage: Storage<LockInfoStorage>;
    keystoreService: KeystoreService;
  }): ProbeTask {
    if (!ProbeTask.instance || ProbeTask.instance.running === false) {
      ProbeTask.instance = new ProbeTask({ backend, storage, keystoreService });
    }
    return ProbeTask.instance;
  }

  running: boolean;
  backend: Backend;
  storage: Storage<LockInfoStorage>;
  keystoreService: KeystoreService;
  handler: unknown;
  run(): void {
    if (this.running) {
      return;
    }
    this.handler = setInterval(async () => {
      console.log('probe task running...');
      // TODO scan all addresses if chain is forked
      await this.syncFullWithCurrentState();
      await this.syncRuleBasedWithCurrentState();
      await this.supplyFullOffChainAddresses();
      await this.supplyRuleBasedOffChainAddresses();
    }, 10_000);
    this.running = true;
  }

  stop(): void {
    clearInterval(this.handler as NodeJS.Timeout);
    this.running = false;
  }

  async syncFullWithCurrentState(): Promise<void> {
    const locksAndPointer: FullLocksAndPointer = await getFullStorageData({ storage: this.storage });
    const updatedExternalLockInfoTasks = offChainFilter({ lockInfos: locksAndPointer.lockInfos.external }).map(
      (lockInfo) => {
        return this.backend.hasHistory({ lock: lockInfo.lock }).then((res) => {
          lockInfo.onchain = res;
          return lockInfo;
        });
      },
    );
    const updatedInternalLockInfoTasks = offChainFilter({ lockInfos: locksAndPointer.lockInfos.change }).map(
      (lockInfo) => {
        return this.backend.hasHistory({ lock: lockInfo.lock }).then((res) => {
          lockInfo.onchain = res;
          return lockInfo;
        });
      },
    );
    // TODO use rpc batch request to reduce http
    const updatedExternalLockInfos = await Promise.all(updatedExternalLockInfoTasks);
    // TODO use rpc batch request to reduce http
    const updatedInternalLockInfos = await Promise.all(updatedInternalLockInfoTasks);

    locksAndPointer.lockInfos.external = updatedExternalLockInfos;
    locksAndPointer.lockInfos.change = updatedInternalLockInfos;
    await this.storage.setItem('full', locksAndPointer);
  }
  async syncRuleBasedWithCurrentState(): Promise<void> {
    const locksAndPointer: RuleBasedLocksAndPointer = await getRuleBasedStorageData({ storage: this.storage });
    const updatedLockInfoTasks = offChainFilter({ lockInfos: locksAndPointer.lockInfos }).map((lockInfo) => {
      return this.backend.hasHistory({ lock: lockInfo.lock }).then((res) => {
        lockInfo.onchain = res;
        return lockInfo;
      });
    });
    // TODO use rpc batch request to reduce http
    const updatedLockInfos = await Promise.all(updatedLockInfoTasks);
    locksAndPointer.lockInfos = updatedLockInfos;
    await this.storage.setItem('ruleBased', locksAndPointer);
  }

  private async syncAllFullExternalLocksInfo(): Promise<void> {
    const locksAndPointer: FullLocksAndPointer = await getFullStorageData({ storage: this.storage });
    let lockInfoLists = await syncAllByPath({
      parentPath: FULL_EXTERNAL_PARENT_PATH,
      threshold: FULL_MAX_LOCK_GAP,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    locksAndPointer.lockInfos.external = lockInfoLists;
    await this.storage.setItem('full', locksAndPointer);
  }
  private async syncAllFullChangeLocksInfo(): Promise<void> {
    const locksAndPointer: FullLocksAndPointer = await getFullStorageData({ storage: this.storage });
    let lockInfoLists = await syncAllByPath({
      parentPath: FULL_CHANGE_PARENT_PATH,
      threshold: FULL_MAX_LOCK_GAP,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    locksAndPointer.lockInfos.change = lockInfoLists;
    await this.storage.setItem('full', locksAndPointer);
  }
  private async syncAllRuleBasedLocksInfo(): Promise<void> {
    const locksAndPointer: RuleBasedLocksAndPointer = await getRuleBasedStorageData({ storage: this.storage });
    let lockInfoLists = await syncAllByPath({
      parentPath: RULE_BASED_HARDENED_PATH,
      threshold: RULE_BASED_MAX_LOCK_GAP,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    locksAndPointer.lockInfos = lockInfoLists;
    await this.storage.setItem('ruleBased', locksAndPointer);
  }

  async syncAllLocksInfo(): Promise<void> {
    await this.syncAllFullExternalLocksInfo();
    await this.syncAllFullChangeLocksInfo();
    await this.syncAllRuleBasedLocksInfo();
  }

  /**
   * make sure full ownership chain has at least 20 offchain locks to use
   * @param payload
   */
  async supplyFullOffChainAddresses(): Promise<void> {
    const storageData: FullLocksAndPointer = await getFullStorageData({ storage: this.storage });
    // supply external addresses if needed
    while (offChainFilter({ lockInfos: storageData.lockInfos.external }).length < FULL_MAX_LOCK_GAP) {
      const path = `m/44'/309'/0'/0/${maxExternalLockIndex({ locksAndPointer: storageData }) + 1}`;
      const nextLockInfo = await generateLockInfoByPath(this.keystoreService, path);
      storageData.lockInfos.external.push(nextLockInfo);
    }
    // supply change addresses if needed
    while (offChainFilter({ lockInfos: storageData.lockInfos.change }).length < FULL_MAX_LOCK_GAP) {
      const path = `m/44'/309'/0'/1/${maxChangeLockIndex({ locksAndPointer: storageData }) + 1}`;
      const nextLockInfo = await generateLockInfoByPath(this.keystoreService, path);
      storageData.lockInfos.change.push(nextLockInfo);
    }
    await this.storage.setItem('full', storageData);
  }
  /**
   * make sure rule based ownership chain has at least 50 offchain locks to use
   * @param payload
   */
  async supplyRuleBasedOffChainAddresses(): Promise<void> {
    const storageData: RuleBasedLocksAndPointer = await getRuleBasedStorageData({ storage: this.storage });
    // supply locks if needed
    while (offChainFilter({ lockInfos: storageData.lockInfos }).length < RULE_BASED_MAX_LOCK_GAP) {
      const path = `${RULE_BASED_HARDENED_PATH}/${maxRuleBasedLockIndex({ locksAndPointer: storageData }) + 1}`;
      const nextLockInfo = await generateLockInfoByPath(this.keystoreService, path);
      storageData.lockInfos.push(nextLockInfo);
    }
    await this.storage.setItem('ruleBased', storageData);
  }
}

export async function syncAllByPath(payload: {
  parentPath: string;
  threshold: number;
  keystoreService: KeystoreService;
  backend: Backend;
}): Promise<LockInfo[]> {
  const lockInfoList: LockInfo[] = [];
  let currentGap = 0;
  for (let index = 0; ; index++) {
    const path = `${payload.parentPath}/${index}`;
    const publicKey = await payload.keystoreService.getPublicKeyByPath({ path });
    const childScript: Script = toSecp256k1Script(publicKey);
    const lockInfo: LockInfo = {
      parentPath: payload.parentPath,
      index,
      publicKey,
      blake160: childScript.args,
      lock: childScript,
      lockHash: utils.computeScriptHash(childScript),
      onchain: false,
    };
    const childScriptHasHistory = await payload.backend.hasHistory({ lock: childScript });
    if (childScriptHasHistory) {
      lockInfo.onchain = true;
      lockInfoList.push(lockInfo);
      currentGap = 0;
    } else {
      lockInfoList.push(lockInfo);
      currentGap++;
      if (currentGap >= payload.threshold) {
        break;
      }
    }
  }
  return lockInfoList;
}
