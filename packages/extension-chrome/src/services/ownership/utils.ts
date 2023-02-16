import { utils } from '@ckb-lumos/base';
import { KeystoreService } from '@nexus-wallet/types';
import { LockInfo } from './types';
import { HexString, Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';

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
export async function generateLockInfoByPath(keystoreService: KeystoreService, path: string): Promise<LockInfo> {
  const index = indexOfPath(path);
  const publicKey = await keystoreService.getPublicKeyByPath({ path });
  const childScript: Script = toSecp256k1Script(publicKey);
  const currentAddressInfo: LockInfo = {
    parentPath: parentOfPath(path),
    index,
    publicKey,
    blake160: childScript.args,
    lock: childScript,
    lockHash: utils.computeScriptHash(childScript),
    // TODO get network from network service?
    network: 'ckb_testnet' as const,
    onchain: false,
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

/**
 * returns the parentPath of the path
 * @param path eg: m/4410179'/0'/0
 * @returns m/4410179'/0'
 */
export function parentOfPath(path: string): string {
  const pathList = path.split('/');
  pathList.pop();
  return pathList.join('/');
}

export function offChain(payload: { lockInfos: LockInfo[] }): LockInfo[] {
  return payload.lockInfos.filter((lockInfo) => !lockInfo.onchain);
}

export function onChain(payload: { lockInfos: LockInfo[] }): LockInfo[] {
  return payload.lockInfos.filter((lockInfo) => lockInfo.onchain);
}

export function updateOffChainLockInfos(payload: {
  offChainLockInfos: LockInfo[];
  allLockInfos: LockInfo[];
}): LockInfo[] {
  const updated = [...payload.allLockInfos];
  payload.offChainLockInfos.forEach((lockInfo) => {
    const index = payload.allLockInfos.findIndex((old) => old.index === lockInfo.index);
    if (index === -1) {
      updated.push(lockInfo);
    } else {
      // TODO mark others as onchain.
      updated[index].onchain = false;
    }
  });
  return updated;
}
