import isEqual from 'lodash.isequal';
import {
  LockInfo,
  StorageSchema,
  MAX_ADDRESS_GAP,
  RULE_BASED_MAX_ADDRESS_GAP,
  LocksManager,
  LocksAndPointer,
} from './locksManager';
import { Storage, KeystoreService } from '@nexus-wallet/types';
import { Backend } from './backend';
import {
  fromJSONString,
  getAddressInfoByPath,
  getAddressInfoDetailsFromStorage,
  getDefaultLocksAndPointer,
  getParentPath,
} from './utils';

export class ProbeTask {
  private static instance: ProbeTask;
  private constructor(payload: {
    backend: Backend;
    storage: Storage<StorageSchema>;
    keystoreService: KeystoreService;
  }) {
    this.running = false;
    this.backend = payload.backend;
    this.storage = payload.storage;
    this.keystoreService = payload.keystoreService;
  }
  static getInstance(backend: Backend, storage: Storage<StorageSchema>, keystoreService: KeystoreService): ProbeTask {
    if (!ProbeTask.instance) {
      ProbeTask.instance = new ProbeTask({ backend, storage, keystoreService });
    }
    return ProbeTask.instance;
  }

  running: boolean;
  backend: Backend;
  storage: Storage<StorageSchema>;
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

  async syncAddressInfoWithCurrentState(payload: { keyName: keyof StorageSchema }): Promise<void> {
    let addressDetails: LocksAndPointer = getDefaultLocksAndPointer();
    const cachedAddressDetailsStr = await this.storage.getItem(payload.keyName);
    if (cachedAddressDetailsStr) {
      addressDetails = fromJSONString({ cachedAddressDetailsStr });
    }
    // external addresses
    const newOnChainExternalAddresses: LockInfo[] = [];
    addressDetails.details.offChain.external.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainExternalAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    addressDetails.details.onChain.external.push(...newOnChainExternalAddresses);
    // remove new on chain locks from cached off chain locks
    addressDetails.details.offChain.external = addressDetails.details.offChain.external.filter(
      (address) => !newOnChainExternalAddresses.includes(address),
    );

    // change addresses
    const newOnChainChangeAddresses: LockInfo[] = [];
    addressDetails.details.offChain.change.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainChangeAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    addressDetails.details.onChain.change.push(...newOnChainChangeAddresses);
    // remove new on chain locks from cached off chain locks
    addressDetails.details.offChain.change = addressDetails.details.offChain.change.filter(
      (address) => !newOnChainChangeAddresses.includes(address),
    );

    const newCacheString = JSON.stringify(addressDetails);
    if (!isEqual(cachedAddressDetailsStr, newCacheString)) {
      this.storage.setItem(payload.keyName, newCacheString);
    }
  }

  /**
   * make sure full ownership chain has at least 20 offchain locks to use
   * make sure rule based ownership chain has at least 50 offchain locks to use
   * @param payload
   */
  async supplyOffChainAddresses(payload: { keyName: keyof StorageSchema }): Promise<void> {
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
      const nextLockInfo = await getAddressInfoByPath(this.keystoreService, path);
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
      const nextLockInfo = await getAddressInfoByPath(this.keystoreService, path);
      lockDetailManager.offChain.change.push(nextLockInfo);
    }
  }
}
