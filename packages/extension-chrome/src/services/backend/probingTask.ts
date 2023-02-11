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
import { fromJSONString, getAddressInfoByPath, getDefaultLocksAndPointer, getParentPath } from './utils';

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
      await this.syncAddressInfoWithCurrentState({ keyName: 'fullOwnershipAddressInfo' });
      await this.syncAddressInfoWithCurrentState({ keyName: 'ruleBasedOwnershipAddressInfo' });
      await this.supplyOffChainAddresses({ keyName: 'fullOwnershipAddressInfo' });
      await this.supplyOffChainAddresses({ keyName: 'ruleBasedOwnershipAddressInfo' });
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
    addressDetails.details.offChainAddresses.externalAddresses.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainExternalAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    addressDetails.details.onChainAddresses.externalAddresses.push(...newOnChainExternalAddresses);
    // remove new on chain locks from cached off chain locks
    addressDetails.details.offChainAddresses.externalAddresses =
      addressDetails.details.offChainAddresses.externalAddresses.filter(
        (address) => !newOnChainExternalAddresses.includes(address),
      );

    // change addresses
    const newOnChainChangeAddresses: LockInfo[] = [];
    addressDetails.details.offChainAddresses.changeAddresses.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainChangeAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    addressDetails.details.onChainAddresses.changeAddresses.push(...newOnChainChangeAddresses);
    // remove new on chain locks from cached off chain locks
    addressDetails.details.offChainAddresses.changeAddresses =
      addressDetails.details.offChainAddresses.changeAddresses.filter(
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
    const shreshold = payload.keyName === 'fullOwnershipAddressInfo' ? MAX_ADDRESS_GAP : RULE_BASED_MAX_ADDRESS_GAP;
    const lockDetail = await this.getAddressInfoDetailsFromStorage({ keyName: payload.keyName });
    const lockDetailManager = new LocksManager({ lockDetail });
    // supply off chain external addresses if needed
    while (lockDetailManager.getOffChainExternalAddresses().length < shreshold) {
      const parentPath = getParentPath({ keyName: payload.keyName });
      const path =
        payload.keyName === 'fullOwnershipAddressInfo'
          ? `${parentPath}/0/${lockDetailManager.currentMaxExternalAddressIndex() + 1}`
          : `${parentPath}/${lockDetailManager.currentMaxExternalAddressIndex() + 1}`;
      const nextLockInfo = await getAddressInfoByPath(this.keystoreService, path);
      lockDetailManager.offChainAddresses.externalAddresses.push(nextLockInfo);
    }
    // supply off chain change addresses if needed
    while (
      // only full ownership chain needs change addresses
      payload.keyName === 'fullOwnershipAddressInfo' &&
      lockDetailManager.getOffChainChangeAddresses().length < shreshold
    ) {
      const parentPath = getParentPath({ keyName: payload.keyName });
      const path = `${parentPath}/1/${lockDetailManager.currentMaxChangeAddressIndex() + 1}`;
      const nextLockInfo = await getAddressInfoByPath(this.keystoreService, path);
      lockDetailManager.offChainAddresses.changeAddresses.push(nextLockInfo);
    }
  }

  async getAddressInfoDetailsFromStorage(payload: { keyName: keyof StorageSchema }): Promise<LocksAndPointer> {
    let addressDetails: LocksAndPointer = getDefaultLocksAndPointer();
    const cachedAddressDetailsStr = await this.storage.getItem(payload.keyName);
    if (cachedAddressDetailsStr) {
      addressDetails = fromJSONString({ cachedAddressDetailsStr });
    }
    return addressDetails;
  }
}
