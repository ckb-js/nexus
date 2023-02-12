import { asserts } from '@nexus-wallet/utils';
import { hashWitness } from '@ckb-lumos/common-scripts/lib/helper';
import { blockchain, Transaction, utils } from '@ckb-lumos/base';
import { KeystoreService, Storage } from '@nexus-wallet/types';
import { LockInfo } from './locksManager';
import { HexString, Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';
import { ckbHash, CKBHasher } from '@ckb-lumos/base/lib/utils';
import { StorageSchema, LocksAndPointer } from './locksManager';

export function toScript(pubkey: HexString): Script {
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
 * This function calculates message for each input lock to sign, and group them by addressInfo.
 * @param tx
 * @param addressInfos
 * @returns
 */
export function getGroupedHash(tx: Transaction, addressInfos: LockInfo[]): [LockInfo, HexString][] {
  // lockHash <-> addressInfo
  const addressInfoMap = new Map<string, LockInfo>();
  // lockHash <-> groupInfo
  const groupInfoMap = new Map<string, number[]>();
  // lockHash <-> signature
  const signatureMap = new Map<string, HexString>();
  // group by script hash
  for (const index in addressInfos) {
    const lock = addressInfos[index].lock;
    const key = ckbHash(blockchain.Script.pack(lock));
    addressInfoMap.set(key, addressInfos[index]);
    const value = groupInfoMap.get(key) || [];
    value.push(Number(index));
    groupInfoMap.set(key, value);
  }
  const inputGroups = groupInfoMap.entries();
  // calculate message to sign
  const txHash = ckbHash(blockchain.RawTransaction.pack(tx));
  let group = inputGroups.next();
  while (!group.done) {
    // group.value[0] is lockHash, group.value[1] is groupInfo
    const indexes = group.value[1];
    const groupIndex = indexes[0];
    asserts.nonEmpty(groupIndex);

    const hasher = new CKBHasher();
    hasher.update(txHash);
    hashWitness(hasher, tx.witnesses[groupIndex]);
    for (let i = 1; i < indexes.length; i++) {
      const j = indexes[i];
      hashWitness(hasher, tx.witnesses[j]);
    }
    for (let i = tx.inputs.length; i < tx.witnesses.length; i++) {
      hashWitness(hasher, tx.witnesses[i]);
    }
    const message = hasher.digestHex();

    signatureMap.set(group.value[0], message);
    group = inputGroups.next();
  }

  let result: [LockInfo, HexString][] = [];
  for (let entry of addressInfoMap) {
    result.push([entry[1], signatureMap.get(entry[0])!]);
  }
  return result;
}

/**
 * @param keystoreService
 * @param path eg: m/4410179'/0'/0
 * @returns
 */
export async function getAddressInfoByPath(keystoreService: KeystoreService, path: string): Promise<LockInfo> {
  const index = indexOfPath(path);
  const pubkey = await keystoreService.getPublicKeyByPath({ path });
  const childScript: Script = toScript(pubkey);
  const currentAddressInfo = {
    path,
    index,
    pubkey,
    blake160: childScript.args,
    lock: childScript,
    lockHash: utils.computeScriptHash(childScript),
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
  if (payload.keyName === 'ruleBasedOwnershipAddressInfo') {
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
