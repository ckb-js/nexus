import isEqual from 'lodash.isequal';
import {
  LockInfo,
  LockInfoStorage,
  MAX_ADDRESS_GAP,
  RULE_BASED_MAX_ADDRESS_GAP,
  LocksManager,
  LocksAndPointer,
} from './locksManager';
import { Storage, KeystoreService } from '@nexus-wallet/types';
import { Backend } from './backend';
import {
  getLockInfoByPath,
  getAddressInfoDetailsFromStorage,
  getDefaultLocksAndPointer,
  getParentPath,
  toSecp256k1Script,
} from './utils';
import { Script, utils } from '@ckb-lumos/base';

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
    if (!ProbeTask.instance) {
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
      await this.syncAddressInfoWithCurrentState({ keyName: 'fullOwnership' });
      await this.syncAddressInfoWithCurrentState({ keyName: 'ruleBasedOwnership' });
      await this.supplyOffChainAddresses({ keyName: 'fullOwnership' });
      await this.supplyOffChainAddresses({ keyName: 'ruleBasedOwnership' });
    }, 10_000);
    this.running = true;
  }

  stop(): void {
    clearInterval(this.handler as NodeJS.Timeout);
    this.running = false;
  }

  async syncAddressInfoWithCurrentState(payload: { keyName: keyof LockInfoStorage }): Promise<void> {
    let locksAndPointer: LocksAndPointer = getDefaultLocksAndPointer();
    const cachedLocks = await this.storage.getItem(payload.keyName);
    if (cachedLocks) {
      locksAndPointer = cachedLocks;
    }
    // external addresses
    const newOnChainExternalAddresses: LockInfo[] = [];
    locksAndPointer.details.offChain.external.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainExternalAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    locksAndPointer.details.onChain.external.push(...newOnChainExternalAddresses);
    // remove new on chain locks from cached off chain locks
    locksAndPointer.details.offChain.external = locksAndPointer.details.offChain.external.filter(
      (address) => !newOnChainExternalAddresses.includes(address),
    );

    // change addresses
    const newOnChainChangeAddresses: LockInfo[] = [];
    locksAndPointer.details.offChain.change.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainChangeAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    locksAndPointer.details.onChain.change.push(...newOnChainChangeAddresses);
    // remove new on chain locks from cached off chain locks
    locksAndPointer.details.offChain.change = locksAndPointer.details.offChain.change.filter(
      (address) => !newOnChainChangeAddresses.includes(address),
    );

    if (!isEqual(cachedLocks, locksAndPointer)) {
      this.storage.setItem(payload.keyName, locksAndPointer);
    }
  }

  async syncAllLocksInfo(): Promise<void> {
    let lockDetail = await getAddressInfoDetailsFromStorage({ storage: this.storage, keyName: 'fullOwnership' });

    let parentPath = `${getParentPath({ keyName: 'fullOwnership' })}/0`;
    let lockInfoLists = await syncAllByPath({
      parentPath,
      threshold: 20,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    lockDetail.details.offChain.external = lockInfoLists.offChainlockInfoList;
    lockDetail.details.onChain.external = lockInfoLists.onChainlockInfoList;

    parentPath = `${getParentPath({ keyName: 'fullOwnership' })}/1`;
    lockInfoLists = await syncAllByPath({
      parentPath,
      threshold: 20,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    lockDetail.details.offChain.change = lockInfoLists.offChainlockInfoList;
    lockDetail.details.onChain.change = lockInfoLists.onChainlockInfoList;

    await this.storage.setItem('fullOwnership', lockDetail);

    lockDetail = await getAddressInfoDetailsFromStorage({ storage: this.storage, keyName: 'fullOwnership' });

    parentPath = getParentPath({ keyName: 'ruleBasedOwnership' });
    lockInfoLists = await syncAllByPath({
      parentPath,
      threshold: 50,
      keystoreService: this.keystoreService,
      backend: this.backend,
    });
    lockDetail.details.offChain.external = lockInfoLists.offChainlockInfoList;
    lockDetail.details.onChain.external = lockInfoLists.onChainlockInfoList;

    await this.storage.setItem('ruleBasedOwnership', lockDetail);
  }

  /**
   * make sure full ownership chain has at least 20 offchain locks to use
   * make sure rule based ownership chain has at least 50 offchain locks to use
   * @param payload
   */
  async supplyOffChainAddresses(payload: { keyName: keyof LockInfoStorage }): Promise<void> {
    const shreshold = payload.keyName === 'fullOwnership' ? MAX_ADDRESS_GAP : RULE_BASED_MAX_ADDRESS_GAP;
    const lockDetail = await getAddressInfoDetailsFromStorage({ keyName: payload.keyName, storage: this.storage });
    const lockDetailManager = new LocksManager({ lockDetail });
    // supply external addresses if needed
    while (lockDetailManager.offChain.external.length < shreshold) {
      const parentPath = getParentPath({ keyName: payload.keyName });
      const path =
        payload.keyName === 'fullOwnership'
          ? `${parentPath}/0/${lockDetailManager.currentMaxExternalAddressIndex() + 1}`
          : `${parentPath}/${lockDetailManager.currentMaxExternalAddressIndex() + 1}`;
      const nextLockInfo = await getLockInfoByPath(this.keystoreService, path);
      lockDetailManager.offChain.external.push(nextLockInfo);
    }
    // supply change addresses if needed
    while (
      // only full ownership chain needs change addresses
      payload.keyName === 'fullOwnership' &&
      lockDetailManager.offChain.change.length < shreshold
    ) {
      const parentPath = getParentPath({ keyName: payload.keyName });
      const path = `${parentPath}/1/${lockDetailManager.currentMaxChangeAddressIndex() + 1}`;
      const nextLockInfo = await getLockInfoByPath(this.keystoreService, path);
      lockDetailManager.offChain.change.push(nextLockInfo);
    }

    const cachedLocks = await this.storage.getItem(payload.keyName);
    const newLocks = lockDetailManager.toLocksAndPointer();
    if (!isEqual(cachedLocks, newLocks)) {
      this.storage.setItem(payload.keyName, newLocks);
    }
  }
}

export async function syncAllByPath(payload: {
  parentPath: string;
  threshold: number;
  keystoreService: KeystoreService;
  backend: Backend;
}): Promise<{
  onChainlockInfoList: LockInfo[];
  offChainlockInfoList: LockInfo[];
}> {
  const onChainlockInfoList: LockInfo[] = [];
  const offChainlockInfoList: LockInfo[] = [];
  let currentGap = 0;
  for (let index = 0; ; index++) {
    const path = `${payload.parentPath}/${index}`;
    const publicKey = await payload.keystoreService.getPublicKeyByPath({ path });
    const childScript: Script = toSecp256k1Script(publicKey);
    const lockInfo: LockInfo = {
      path,
      index,
      publicKey,
      blake160: childScript.args,
      lock: childScript,
      // TODO implement mainnet here
      network: 'ckb_testnet',
      lockHash: utils.computeScriptHash(childScript),
    };
    const childScriptHasHistory = await payload.backend.hasHistory({ lock: childScript });
    if (childScriptHasHistory) {
      onChainlockInfoList.push(lockInfo);
      currentGap = 0;
    } else {
      offChainlockInfoList.push(lockInfo);
      currentGap++;
      if (currentGap >= payload.threshold) {
        break;
      }
    }
  }
  return { onChainlockInfoList, offChainlockInfoList };
}