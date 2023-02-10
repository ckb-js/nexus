import { bytes } from '@ckb-lumos/codec';
import { KeystoreService, Storage, Promisable } from '@nexus-wallet/types';
import { Script } from '@ckb-lumos/base';
import { Backend } from './backend';
import { toScript } from './utils';

const MAX_ADDRESS_GAP = 20;
// circular queue length of rule based address discovery
const RULE_BASED_MAX_LOOP_GAP = 50;

export type StorageSchema = {
  fullOwnershipAddressInfo: string;
  ruleBasedOwnershipAddressInfo: string;
};

export type AddressInfo = {
  path: string;
  addressIndex: number;
  depth?: number;
  pubkey: string;
  blake160: string;
  lock: Script;
};

type AddressInfoDetail = {
  onChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  offChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
};
export interface AddressStorage {
  ownershipType: 'FULL' | 'RULE_BASED';
  onChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  offChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };

  getHardendedPathPrefix: () => string; // m/44'/309'/0' for full ownership, m/4410179'/0' for rule based ownership
  // updateUnusedAddresses: (payload: { keystoreService: KeystoreService }) => Promise<void>;
  getOnChainExternalAddresses: () => AddressInfo[];
  setOnChainExternalAddresses: (addresses: AddressInfo[]) => void;
  getOnChainChangeAddresses: () => AddressInfo[];
  setOnChainChangeAddresses: (addresses: AddressInfo[]) => void;
  getAllOnChainAddresses: () => AddressInfo[];

  getOffChainExternalAddresses: () => AddressInfo[];
  setOffChainExternalAddresses: (addresses: AddressInfo[]) => void;
  getOffChainChangeAddresses: () => AddressInfo[];
  setOffChainChangeAddresses: (addresses: AddressInfo[]) => void;
  getAllOffChainAddresses: () => AddressInfo[];

  getAddressInfoByLock: (payload: { lock: Script }) => AddressInfo | undefined;
  syncAddressInfo: (payload: { change?: boolean }) => Promise<void>;
  syncAllAddressInfo: () => Promise<void>;

  // brutally sync from index 0
  syncAllAddressInfoFromScratch: () => Promise<void>;
  // sync from current state
  syncAddressInfoWithCurrentState: () => Promise<void>;
  toJSONString: () => string;
  saveToStorage: (payload: { storage: Storage<StorageSchema> }) => Promise<void>;

  // update addresses list when a new tx(containing unused locks) is on chain.
  markAddressAsUsed: (payload: { addressInfo: AddressInfo[] }) => void;
  isExternalAddress: (payload: { addressInfo: AddressInfo }) => boolean;
  /**
   * if there is no addresses in the storage, return -1
   * @returns the max address index in the storage
   */
  currentMaxAddressIndex: () => number;
  deriveNextAddressPair: () => Promisable<{ externalAddress: AddressInfo; changeAddress?: AddressInfo }>;
}

export abstract class AbstractAddressStorage implements AddressStorage {
  backend: Backend;
  keystoreService: KeystoreService;
  onChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  offChainAddresses: {
    externalAddresses: AddressInfo[];
    changeAddresses: AddressInfo[];
  };
  constructor(
    backend: Backend,
    keystoreService: KeystoreService,
    onChainExternalAddresses: AddressInfo[] = [],
    onChainChangeAddresses: AddressInfo[] = [],
    offChainExternalAddresses: AddressInfo[] = [],
    offChainChangeAddresses: AddressInfo[] = [],
  ) {
    this.backend = backend;
    this.keystoreService = keystoreService;
    this.onChainAddresses = {
      externalAddresses: onChainExternalAddresses,
      changeAddresses: onChainChangeAddresses,
    };
    this.offChainAddresses = {
      externalAddresses: offChainExternalAddresses,
      changeAddresses: offChainChangeAddresses,
    };
  }
  toJSONString(): string {
    return JSON.stringify({
      onChainAddresses: this.onChainAddresses,
      offChainAddresses: this.offChainAddresses,
    });
  }

  abstract syncAddressInfo(payload: { change?: boolean | undefined }): Promise<void>;
  abstract syncAllAddressInfo(): Promise<void>;
  abstract ownershipType: 'FULL' | 'RULE_BASED';
  abstract getHardendedPathPrefix(): string;
  abstract isExternalAddress(payload: { addressInfo: AddressInfo }): boolean;
  abstract deriveNextAddressPair(): Promisable<{ externalAddress: AddressInfo; changeAddress?: AddressInfo }>;

  currentMaxAddressIndex(): number {
    let result = -1;
    this.getAllOnChainAddresses().forEach((address) => {
      if (address.addressIndex > result) {
        result = address.addressIndex;
      }
    });
    this.getAllOnChainAddresses().forEach((address) => {
      if (address.addressIndex > result) {
        result = address.addressIndex;
      }
    });
    return result;
  }

  async syncAllAddressInfoFromScratch(): Promise<void> {
    await this.syncAllAddressInfo();
  }
  async syncAddressInfoWithCurrentState(): Promise<void> {
    // external addresses
    const newOnChainExternalAddresses: AddressInfo[] = [];
    this.offChainAddresses.externalAddresses.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainExternalAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    this.onChainAddresses.externalAddresses.push(...newOnChainExternalAddresses);
    // remove new on chain locks from cached off chain locks
    this.offChainAddresses.externalAddresses = this.offChainAddresses.externalAddresses.filter(
      (address) => !newOnChainExternalAddresses.includes(address),
    );

    // change addresses
    const newOnChainChangeAddresses: AddressInfo[] = [];
    this.offChainAddresses.changeAddresses.forEach(async (address) => {
      if (await this.backend.hasHistory({ lock: address.lock })) {
        newOnChainChangeAddresses.push(address);
      }
    });
    // add new on chain locks to cached on chain locks
    this.onChainAddresses.changeAddresses.push(...newOnChainChangeAddresses);
    // remove new on chain locks from cached off chain locks
    this.offChainAddresses.changeAddresses = this.offChainAddresses.changeAddresses.filter(
      (address) => !newOnChainChangeAddresses.includes(address),
    );
  }

  async saveToStorage(payload: { storage: Storage<StorageSchema> }): Promise<void> {
    return await payload.storage.setItem('fullOwnershipAddressInfo', this.toJSONString());
  }

  markAddressAsUsed(payload: { addressInfo: AddressInfo[] }): void {
    payload.addressInfo.forEach((address) => {
      const isExternalAddress = this.isExternalAddress({ addressInfo: address });
      if (isExternalAddress) {
        const needUpdate = !this.onChainAddresses.externalAddresses.some(
          (onChainAddress) => onChainAddress.path === address.path,
        );
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChainAddresses.externalAddresses.push(address);
          // remove from cached off chain addresses
          this.offChainAddresses.externalAddresses = this.offChainAddresses.externalAddresses.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      } else {
        const needUpdate = !this.onChainAddresses.changeAddresses.some(
          (onChainAddress) => onChainAddress.path === address.path,
        );
        if (needUpdate) {
          // add to cached on chain addresses
          this.onChainAddresses.changeAddresses.push(address);
          // remove from cached off chain addresses
          this.offChainAddresses.changeAddresses = this.offChainAddresses.changeAddresses.filter(
            (offChainAddress) => offChainAddress.path !== address.path,
          );
        }
      }
    });
  }

  getAddressInfoByLock(payload: { lock: Script }): AddressInfo | undefined {
    const lock = payload.lock;
    return (
      this.onChainAddresses.externalAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.onChainAddresses.changeAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.offChainAddresses.externalAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      ) ||
      this.offChainAddresses.changeAddresses.find(
        (address) => bytes.equal(lock.codeHash, address.lock.codeHash) && bytes.equal(lock.args, address.lock.args),
      )
    );
  }
  getOnChainExternalAddresses(): AddressInfo[] {
    return this.onChainAddresses.externalAddresses;
  }
  setOnChainExternalAddresses(addresses: AddressInfo[]): void {
    this.onChainAddresses.externalAddresses = addresses;
  }
  getOnChainChangeAddresses(): AddressInfo[] {
    return this.onChainAddresses.changeAddresses;
  }
  setOnChainChangeAddresses(addresses: AddressInfo[]): void {
    this.onChainAddresses.changeAddresses = addresses;
  }
  getAllOnChainAddresses(): AddressInfo[] {
    return [...this.onChainAddresses.externalAddresses, ...this.onChainAddresses.changeAddresses];
  }

  getOffChainExternalAddresses(): AddressInfo[] {
    return this.offChainAddresses.externalAddresses;
  }
  setOffChainExternalAddresses(addresses: AddressInfo[]): void {
    this.offChainAddresses.externalAddresses = addresses;
  }
  getOffChainChangeAddresses(): AddressInfo[] {
    return this.offChainAddresses.changeAddresses;
  }
  setOffChainChangeAddresses(addresses: AddressInfo[]): void {
    this.offChainAddresses.changeAddresses = addresses;
  }
  getAllOffChainAddresses(): AddressInfo[] {
    return [...this.offChainAddresses.externalAddresses, ...this.offChainAddresses.changeAddresses];
  }
}

export class FullOwnershipAddressStorage extends AbstractAddressStorage {
  ownershipType = 'FULL' as const;
  static async loadFromStorage(payload: {
    storage: Storage<StorageSchema>;
    backend: Backend;
    keystoreService: KeystoreService;
  }): Promise<FullOwnershipAddressStorage | undefined> {
    const str = await payload.storage.getItem('fullOwnershipAddressInfo')!;
    if (!str) return undefined;
    const addressInfos = fromJSONString({ str });
    return new FullOwnershipAddressStorage(
      payload.backend,
      payload.keystoreService,
      addressInfos.onChainAddresses.externalAddresses,
      addressInfos.onChainAddresses.changeAddresses,
      addressInfos.offChainAddresses.externalAddresses,
      addressInfos.offChainAddresses.changeAddresses,
    );
  }
  getHardendedPathPrefix(): string {
    return "m/44'/309'/0'";
  }
  isExternalAddress(payload: { addressInfo: AddressInfo }): boolean {
    const pathList = payload.addressInfo.path.split('/');
    const isChange = pathList[pathList.length - 2] === '1';
    return isChange;
  }
  async deriveNextAddressPair(): Promise<{ externalAddress: AddressInfo; changeAddress: AddressInfo }> {
    const nextExternalPath = `${this.getHardendedPathPrefix()}/0/${this.currentMaxAddressIndex() + 1}`;
    const nextChangePath = `${this.getHardendedPathPrefix()}/1/${this.currentMaxAddressIndex() + 1}`;
    const nextExternalAddressInfo = await getAddressInfoByPath(this.keystoreService, nextExternalPath);
    const nextChangeAddressInfo = await getAddressInfoByPath(this.keystoreService, nextChangePath);
    this.offChainAddresses.externalAddresses.push(nextExternalAddressInfo);
    this.offChainAddresses.changeAddresses.push(nextChangeAddressInfo);
    return {
      externalAddress: nextExternalAddressInfo,
      changeAddress: nextChangeAddressInfo,
    };
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
    const offChainAddressInfos: AddressInfo[] = [];
    let currentGap = 0;
    // TODO: use sampling to improve performance
    for (let index = 0; ; index++) {
      const currentAddressInfo = await getAddressInfoByPath(
        this.keystoreService,
        `${this.getHardendedPathPrefix()}/${payload.change ? 1 : 0}/${index}`,
      );
      const childScriptHasHistory = await this.backend.hasHistory({ lock: currentAddressInfo.lock });
      if (childScriptHasHistory) {
        addressInfos.push(currentAddressInfo);
        currentGap = 0;
      } else {
        offChainAddressInfos.push(currentAddressInfo);
        currentGap++;
        if (currentGap >= MAX_ADDRESS_GAP) {
          break;
        }
      }
    }

    if (payload.change) {
      this.setOffChainChangeAddresses(offChainAddressInfos);
      this.setOnChainChangeAddresses(addressInfos);
    } else {
      this.setOffChainExternalAddresses(offChainAddressInfos);
      this.setOnChainExternalAddresses(addressInfos);
    }
  }
}
export class RuleBasedAddressStorage extends AbstractAddressStorage {
  ownershipType = 'RULE_BASED' as const;
  static async loadFromStorage(payload: {
    storage: Storage<StorageSchema>;
    backend: Backend;
    keystoreService: KeystoreService;
  }): Promise<RuleBasedAddressStorage | undefined> {
    const str = await payload.storage.getItem('ruleBasedOwnershipAddressInfo')!;
    if (!str) return undefined;
    const addressInfos = fromJSONString({ str });
    return new RuleBasedAddressStorage(
      payload.backend,
      payload.keystoreService,
      addressInfos.onChainAddresses.externalAddresses,
      addressInfos.onChainAddresses.changeAddresses,
      addressInfos.offChainAddresses.externalAddresses,
      addressInfos.offChainAddresses.changeAddresses,
    );
  }
  getHardendedPathPrefix(): string {
    // https://github.com/ckb-js/nexus/pull/9/files#diff-1f583e1e0396a08122d2991f1bc3d22b0125a40a9725a5a46e973749edb2ce8aR20
    // 4410179 for 0x434b42
    return "m/4410179'/0'";
  }
  isExternalAddress(): boolean {
    return true;
  }
  async deriveNextAddressPair(): Promise<{ externalAddress: AddressInfo; changeAddress?: AddressInfo }> {
    const nextExternalPath = `${this.getHardendedPathPrefix()}/0/${this.currentMaxAddressIndex() + 1}`;
    const nextExternalAddressInfo = await getAddressInfoByPath(this.keystoreService, nextExternalPath);
    this.offChainAddresses.externalAddresses.push(nextExternalAddressInfo);
    return {
      externalAddress: nextExternalAddressInfo,
    };
  }
  async syncAllAddressInfo(): Promise<void> {
    // sync on chain addresses
    await this.syncAddressInfo();
  }
  async syncAddressInfo(): Promise<void> {
    // only sync external addresses
    const addressInfos: AddressInfo[] = [];
    const offChainAddressInfos: AddressInfo[] = [];
    let currentGap = 0;
    // TODO: use sampling to improve performance
    for (let index = 0; ; index++) {
      const currentAddressInfo = await getAddressInfoByPath(
        this.keystoreService,
        `${this.getHardendedPathPrefix()}/${index}`,
      );
      const childScriptHasHistory = await this.backend.hasHistory({ lock: currentAddressInfo.lock });
      if (childScriptHasHistory) {
        addressInfos.push(currentAddressInfo);
        currentGap = 0;
      } else {
        offChainAddressInfos.push(currentAddressInfo);
        currentGap++;
        if (currentGap >= RULE_BASED_MAX_LOOP_GAP) {
          break;
        }
      }
    }
    // update offChain addresses
    this.setOffChainExternalAddresses(offChainAddressInfos);
    this.setOnChainExternalAddresses(addressInfos);
  }
}

/**
 * @param keystoreService
 * @param path eg: m/4410179'/0'/0
 * @returns
 */
async function getAddressInfoByPath(keystoreService: KeystoreService, path: string) {
  const index = indexOfPath(path);
  const pubkey = await keystoreService.getPublicKeyByPath({ path });
  const childScript: Script = toScript(pubkey);
  const currentAddressInfo = {
    path,
    addressIndex: index,
    pubkey,
    blake160: childScript.args,
    lock: childScript,
  };
  return currentAddressInfo;
}

/**
 * returns the address index of the path
 * @param path eg: m/4410179'/0'/0
 * @returns 0
 */
function indexOfPath(path: string): number {
  const pathList = path.split('/');
  return Number(pathList[pathList.length - 1]);
}

function fromJSONString(payload: { str: string }): AddressInfoDetail {
  return JSON.parse(payload.str);
}
