import { AddressInfo } from './addressStorage';
import { Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config } from '@ckb-lumos/lumos';
import { Keychain } from '@ckb-lumos/hd';

/**
 *  This function will NOT call `derivePath` of keychain, The keychain should be aligned with the path passed in.
 * @param keychain
 * @param path
 * @returns
 */
export function getAddressInfo(keychain: Keychain, path: string): AddressInfo {
  // const Keychain = keychain.derivePath(path); // to achive better performance, don't call this
  const scriptArgs = publicKeyToBlake160(`0x${keychain.publicKey.toString('hex')}`);
  const lock: Script = {
    codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: 'type',
    args: scriptArgs,
  };
  return {
    path,
    addressIndex: keychain.index,
    depth: keychain.depth,
    pubkey: keychain.publicKey.toString('hex'),
    blake160: scriptArgs,
    lock,
  };
}
