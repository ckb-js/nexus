import { utils } from '@ckb-lumos/base';
import { KeystoreService, Storage } from '@nexus-wallet/types';
import { LockInfo } from './locksManager';
import { HexString, Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';
import { LockInfoStorage, LocksAndPointer } from './locksManager';

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
export async function getLockInfoByPath(keystoreService: KeystoreService, path: string): Promise<LockInfo> {
  const index = indexOfPath(path);
  const publicKey = await keystoreService.getPublicKeyByPath({ path });
  const childScript: Script = toSecp256k1Script(publicKey);
  const currentAddressInfo: LockInfo = {
    path,
    index,
    publicKey,
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

export function getParentPath(payload: { keyName: keyof LockInfoStorage }): string {
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
  storage: Storage<LockInfoStorage>;
  keyName: keyof LockInfoStorage;
}): Promise<LocksAndPointer> {
  let addressDetails: LocksAndPointer = getDefaultLocksAndPointer();
  const cachedLocks = await payload.storage.getItem(payload.keyName);
  if (cachedLocks) {
    return cachedLocks;
  }
  return addressDetails;
}

export function isExternalLockInfo(payload: { lockInfo: LockInfo }): boolean {
  const pathList = payload.lockInfo.path.split('/');
  const isChange = pathList[pathList.length - 2] === '1';
  return !isChange;
}
