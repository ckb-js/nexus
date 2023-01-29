import { Script } from '@ckb-lumos/base';
import { Keychain } from '@ckb-lumos/hd';
import { Backend } from './index';
import { getAddressInfo } from './utils';
export type AddressInfo = {
  path: string;
  addressIndex: number;
  depth: number;
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
  updateUnusedAddresses: (keychain: Keychain) => Promise<void>;
  getUsedExternalAddresses: () => AddressInfo[];
  getUsedChangeAddresses: () => AddressInfo[];
  getUnusedAddresses: () => Promise<AddressInfo[]>;

  // getMaxAddressIndex: () => number;
  getAddressInfoByLock: (lock: Script) => AddressInfo | undefined;
}

export class DefaultAddressStorage implements AddressStorage {
  backend: Backend;
  usedAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  unusedAddresses: AddressInfo[];

  constructor(
    backend: Backend,
    usedExternalAddresses: AddressInfo[],
    usedChangeAddresses: AddressInfo[],
    unusedAddresses: AddressInfo[],
  ) {
    this.backend = backend;
    this.usedAddresses = {
      externalAddresses: usedExternalAddresses,
      changeAddresses: usedChangeAddresses,
    };
    this.unusedAddresses = unusedAddresses;
  }
  getAddressInfoByLock(lock: Script): AddressInfo | undefined {
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
  async updateUnusedAddresses(keychain: Keychain): Promise<void> {
    const stillUnused: AddressInfo[] = [];
    const newUsed: AddressInfo[] = [];
    const newChangeAddressUsed: AddressInfo[] = [];
    for (const address of this.unusedAddresses) {
      const count = await this.backend.countTx(address.lock);
      if (count > 0) {
        newUsed.push(address);
        // detect if change address is used too.
        const addressIndex = address.addressIndex;
        const changePath = `m/44'/309'/0'/1/${addressIndex}`;
        const changeKeychain = keychain.derivePath(changePath);
        const changeAddressInfo = getAddressInfo(changeKeychain, changePath);
        const changeTxcount = await this.backend.countTx(changeAddressInfo.lock);
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
