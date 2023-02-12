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
import { getLockInfoByPath, getAddressInfoDetailsFromStorage, getDefaultLocksAndPointer, getParentPath } from './utils';

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
  run(): void {
    if (this.running) {
      return;
    }
    setInterval(async () => {
      console.log('probe task running...');
      // TODO scan all addresses if chain is forked
      await this.syncAddressInfoWithCurrentState({ keyName: 'fullOwnership' });
      await this.syncAddressInfoWithCurrentState({ keyName: 'ruleBasedOwnership' });
      await this.supplyOffChainAddresses({ keyName: 'fullOwnership' });
      await this.supplyOffChainAddresses({ keyName: 'ruleBasedOwnership' });
    }, 10_000);
    this.running = true;
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
    while (lockDetailManager.getOffChainExternalAddresses().length < shreshold) {
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
      lockDetailManager.getOffChainChangeAddresses().length < shreshold
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
