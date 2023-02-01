import { KeystoreService } from '@nexus-wallet/types';
import { AddressInfo } from './addressStorage';
import { Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';

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
