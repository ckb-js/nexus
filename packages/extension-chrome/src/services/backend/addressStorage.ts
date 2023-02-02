import { KeystoreService } from '@nexus-wallet/types';
import { Script } from '@ckb-lumos/base';
import { Backend } from './index';
import { getAddressInfo, toScript } from './utils';

const MAX_ADDRESS_GAP = 20;

export type AddressInfo = {
  path: string;
  addressIndex: number;
  depth?: number;
  pubkey: string;
  blake160: string;
  lock: Script;
};
export interface AddressStorage {
  usedAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  unusedAddresses: AddressInfo[];
  updateUnusedAddresses: (payload: { keystoreService: KeystoreService }) => Promise<void>;
  getUsedExternalAddresses: () => AddressInfo[];
  getUsedChangeAddresses: () => AddressInfo[];
  getUnusedAddresses: () => Promise<AddressInfo[]>;

  // getMaxAddressIndex: () => number;
  getAddressInfoByLock: (payload: { lock: Script }) => AddressInfo | undefined;
  syncUsedAddressInfo: (payload: { change?: boolean }) => Promise<void>;
  syncAllAddressInfo: () => Promise<void>;
}

export class DefaultAddressStorage implements AddressStorage {
  backend: Backend;
  keystoreService: KeystoreService;
  usedAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  unusedAddresses: AddressInfo[];

  constructor(
    backend: Backend,
    keystoreService: KeystoreService,
    usedExternalAddresses: AddressInfo[] = [],
    usedChangeAddresses: AddressInfo[] = [],
    unusedAddresses: AddressInfo[] = [],
  ) {
    this.backend = backend;
    this.keystoreService = keystoreService;
    this.usedAddresses = {
      externalAddresses: usedExternalAddresses,
      changeAddresses: usedChangeAddresses,
    };
    this.unusedAddresses = unusedAddresses;
  }
  async syncAllAddressInfo(): Promise<void> {
    // sync used external addresses
    await this.syncUsedAddressInfo({});
    // sync used change addresses
    await this.syncUsedAddressInfo({ change: true });
  }
  async syncUsedAddressInfo(payload: { change?: boolean }): Promise<void> {
    // refer to bip-44-account-discovery https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
    // 1. derive the first account's node (index = 0)
    // 2. derive the external chain node of this account
    // 3. scan addresses of the external chain; respect the gap limit (20)

    const addressInfos: AddressInfo[] = [];
    let currentGap = 0;
    for (let index = 0; ; index++) {
      const pubkey = this.keystoreService.getChildPubkey({ change: false, index });
      const childScript: Script = toScript(pubkey);
      const childScriptHasHistory = await this.backend.hasHistory({ lock: childScript });
      if (childScriptHasHistory) {
        addressInfos.push({
          path: `m/44'/309'/0'/0/${index}`,
          addressIndex: index,
          pubkey,
          blake160: childScript.args,
          lock: childScript,
        });
        currentGap = 0;
      } else {
        currentGap++;
        if (currentGap >= MAX_ADDRESS_GAP) {
          break;
        }
      }
    }
    payload.change ? this.setUsedChangeAddresses(addressInfos) : this.setUsedExternalAddresses(addressInfos);
  }
  getAddressInfoByLock(payload: { lock: Script }): AddressInfo | undefined {
    const lock = payload.lock;
    return (
      this.usedAddresses.externalAddresses.find(
        (address) => address.lock.codeHash === lock.codeHash && address.lock.args === lock.args,
      ) ||
      this.usedAddresses.changeAddresses.find(
        (address) => address.lock.codeHash === lock.codeHash && address.lock.args === lock.args,
      ) ||
      this.unusedAddresses.find((address) => address.lock.codeHash === lock.codeHash && address.lock.args === lock.args)
    );
  }
  getUsedExternalAddresses(): AddressInfo[] {
    return this.usedAddresses.externalAddresses;
  }
  setUsedExternalAddresses(addresses: AddressInfo[]): void {
    this.usedAddresses.externalAddresses = addresses;
  }
  getUsedChangeAddresses(): AddressInfo[] {
    return this.usedAddresses.changeAddresses;
  }
  setUsedChangeAddresses(addresses: AddressInfo[]): void {
    this.usedAddresses.changeAddresses = addresses;
  }
  async getUnusedAddresses(): Promise<AddressInfo[]> {
    return this.unusedAddresses;
  }
  setUnusedAddresses(addresses: AddressInfo[]): void {
    this.unusedAddresses = addresses;
  }

  // check all unused addresses status and update the used/unused list
  async updateUnusedAddresses(payload: { keystoreService: KeystoreService }): Promise<void> {
    const keystoreService = payload.keystoreService;
    const stillUnused: AddressInfo[] = [];
    const newUsed: AddressInfo[] = [];
    const newChangeAddressUsed: AddressInfo[] = [];
    for (const address of this.unusedAddresses) {
      const hasHistory = await this.backend.hasHistory({ lock: address.lock });
      if (hasHistory) {
        newUsed.push(address);
        // detect if change address is used too.
        const addressIndex = address.addressIndex;
        const changeAddressInfo = getAddressInfo(keystoreService, true, addressIndex);
        const changeTxcount = await this.backend.hasHistory({ lock: changeAddressInfo.lock });
        !!changeTxcount && newChangeAddressUsed.push(changeAddressInfo);
      } else {
        stillUnused.push(address);
      }
    }
    this.unusedAddresses = stillUnused;
    this.usedAddresses.externalAddresses.push(...newUsed);
    this.usedAddresses.changeAddresses.push(...newChangeAddressUsed);
  }
}
