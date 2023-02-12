import { utils } from '@ckb-lumos/base';
import { KeystoreService, Storage } from '@nexus-wallet/types';
import { LockInfo } from './locksManager';
import { HexString, Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';
import { StorageSchema, LocksAndPointer } from './locksManager';

export function toSecp256k1Script(pubkey: HexString): Script {
  // args for SECP256K1_BLAKE160 script
  const scriptArgs = publicKeyToBlake160(pubkey);
  const script: Script = {
    codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: 'type',
    args: scriptArgs,
  };
  return script;
}

/**
 * @param keystoreService
 * @param path eg: m/4410179'/0'/0
 * @returns
 */
export async function getAddressInfoByPath(keystoreService: KeystoreService, path: string): Promise<LockInfo> {
  const index = indexOfPath(path);
  const pubkey = await keystoreService.getPublicKeyByPath({ path });
  const childScript: Script = toSecp256k1Script(pubkey);
  const currentAddressInfo = {
    path,
    index,
    pubkey,
    blake160: childScript.args,
    lock: childScript,
    lockHash: utils.computeScriptHash(childScript),
    // TODO get network from network service?
    network: 'ckb_testnet' as const,
  };
  return currentAddressInfo;
}

/**
 * returns the address index of the path
 * @param path eg: m/4410179'/0'/0
 * @returns 0
 */
export function indexOfPath(path: string): number {
  const pathList = path.split('/');
  return Number(pathList[pathList.length - 1]);
}

export function isFullOwnership(path: string): boolean {
  return path.startsWith("m/44'/309'/0'");
}

export function isRuleBasedOwnership(path: string): boolean {
  return path.startsWith("m/4410179'/0'");
}

export function fromJSONString(payload: { cachedAddressDetailsStr: string }): LocksAndPointer {
  return JSON.parse(payload.cachedAddressDetailsStr);
}

export function getParentPath(payload: { keyName: keyof StorageSchema }): string {
  const fullOwnershipParentPath = "m/44'/309'/0'";
  const ruleBasedOwnershipParentPath = "m/4410179'/0'";
  if (payload.keyName === 'ruleBasedOwnership') {
    return ruleBasedOwnershipParentPath;
  }
  return fullOwnershipParentPath;
}

export function getDefaultLocksAndPointer(): LocksAndPointer {
  return {
    details: {
      onChain: { external: [], change: [] },
      offChain: { external: [], change: [] },
    },
    pointers: {
      onChain: {
        external: -1,
        change: -1,
      },
      offChain: {
        external: -1,
        change: -1,
      },
    },
  };
}

export async function getAddressInfoDetailsFromStorage(payload: {
  storage: Storage<StorageSchema>;
  keyName: keyof StorageSchema;
}): Promise<LocksAndPointer> {
  let addressDetails: LocksAndPointer = getDefaultLocksAndPointer();
  const cachedAddressDetailsStr = await payload.storage.getItem(payload.keyName);
  if (cachedAddressDetailsStr) {
    addressDetails = fromJSONString({ cachedAddressDetailsStr });
  }
  return addressDetails;
}
