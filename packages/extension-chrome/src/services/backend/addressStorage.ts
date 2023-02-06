import { bytes } from '@ckb-lumos/codec';
import { KeystoreService } from '@nexus-wallet/types';
import { Script } from '@ckb-lumos/base';
import { Backend } from './backend';
import { toScript } from './utils';

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
  // updateUnusedAddresses: (payload: { keystoreService: KeystoreService }) => Promise<void>;
  getUsedExternalAddresses: () => AddressInfo[];
  getUsedChangeAddresses: () => AddressInfo[];
  getAllUsedAddresses: () => AddressInfo[];
  getUnusedAddresses: () => Promise<AddressInfo[]>;

  // getMaxAddressIndex: () => number;
  getAddressInfoByLock: (payload: { lock: Script }) => AddressInfo | undefined;
  syncAddressInfo: (payload: { change?: boolean }) => Promise<void>;
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
    await this.syncAddressInfo({});
    // sync used change addresses
    await this.syncAddressInfo({ change: true });
  }
  async syncAddressInfo(payload: { change?: boolean }): Promise<void> {
    // refer to bip-44-account-discovery https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
    // 1. derive the first account's node (index = 0)
    // 2. derive the external chain node of this account
    // 3. scan addresses of the external chain; respect the gap limit (20)

    const addressInfos: AddressInfo[] = [];
    let currentGap = 0;
    // TODO: use sampling to improve performance
    for (let index = 0; ; index++) {
      const path = `m/44'/309'/0'/${payload.change ? 1 : 0}/${index}`;
      const pubkey = await this.keystoreService.getPublicKeyByPath({ path });
      const childScript: Script = toScript(pubkey);
      const childScriptHasHistory = await this.backend.hasHistory({ lock: childScript });
      if (childScriptHasHistory) {
        addressInfos.push({
          path,
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
    // update unused addresses, remove all used addresses
    this.unusedAddresses = this.unusedAddresses.filter(
      (address) => !addressInfos.find((usedAddress) => usedAddress.path === address.path),
    );
    payload.change ? this.setUsedChangeAddresses(addressInfos) : this.setUsedExternalAddresses(addressInfos);
  }
  getAddressInfoByLock(payload: { lock: Script }): AddressInfo | undefined {
    const lock = payload.lock;
    return (
      this.usedAddresses.externalAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.usedAddresses.changeAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.unusedAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      )
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
  getAllUsedAddresses(): AddressInfo[] {
    return [...this.usedAddresses.externalAddresses, ...this.usedAddresses.changeAddresses];
  }
  async getUnusedAddresses(): Promise<AddressInfo[]> {
    await this.syncAllAddressInfo();
    return this.unusedAddresses;
  }
  setUnusedAddresses(addresses: AddressInfo[]): void {
    this.unusedAddresses = addresses;
  }
}
