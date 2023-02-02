import { asserts } from '@nexus-wallet/utils';
import { hashWitness } from '@ckb-lumos/common-scripts/lib/helper';
import { blockchain, Transaction } from '@ckb-lumos/base';
import { KeystoreService } from '@nexus-wallet/types';
import { AddressInfo } from './addressStorage';
import { HexString, Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';
import { ckbHash, CKBHasher } from '@ckb-lumos/base/lib/utils';

/**
 *  This function will NOT call `derivePath` of keychain, The keychain should be aligned with the path passed in.
 * @param keychain
 * @param path
 * @returns
 */
export function getAddressInfo(keystoreService: KeystoreService, change = false, index: number): AddressInfo {
  const pubkey = keystoreService.getChildPubkey({ change, index });
  const scriptArgs = publicKeyToBlake160(pubkey);
  const lock: Script = {
    codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: 'type',
    args: scriptArgs,
  };
  return {
    path: `m/44'/309'/0'/${change ? 1 : 0}/${index}`,
    addressIndex: index,
    pubkey,
    blake160: scriptArgs,
    lock,
  };
}

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
export function getGroupedHash(tx: Transaction, addressInfos: AddressInfo[]): [AddressInfo, HexString][] {
  // lockHash <-> addressInfo
  const addressInfoMap = new Map<string, AddressInfo>();
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

  let result: [AddressInfo, HexString][] = [];
  for (let entry of addressInfoMap) {
    result.push([entry[1], signatureMap.get(entry[0])!]);
  }
  return result;
}
