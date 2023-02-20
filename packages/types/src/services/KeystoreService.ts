import type { BytesLike } from '@ckb-lumos/codec';
import type { HexString } from '@ckb-lumos/lumos';
import type { Promisable } from '../base';
import { Provider } from './common';

export interface KeystoreService {
  /**
   * check if the keystore is initialized
   */
  hasInitialized(): Promisable<boolean>;

  /**
   * initialize the keystore
   * @param payload
   */
  initKeystore(payload: InitKeystorePayload): Promisable<void>;

  /**
   * check if the password is correct
   */
  checkPassword(payload: { password: string }): Promisable<boolean>;

  /**
   * get an extended public key by a derivation path,
   * if the corresponding extended public is not found in store or cache,
   * the password will be required to derive the extended public key
   * @param payload
   */
  getExtendedPublicKey(payload: GetExtendedPublicKeyPayload): Promisable<HexString>;

  /**
   *
   * @param payload {@link SignMessagePayload}
   */
  signMessage(payload: SignMessagePayload): Promisable<HexString>;

  /**
   * clear all data about the keystore, including the mnemonic, extended public keys, etc.
   */
  reset(): Promisable<void>;
}

export interface GetExtendedPublicKeyPayload {
  path: HardenedPath | NonHardenedPath;
  password?: PasswordProvider;
}

/**
 * A {@link https://ethereum.org/en/developers/docs/data-structures-and-encoding/web3-secret-storage/ Web3 secret storage} wrapper,
 * to interact with the keystore
 */
export interface InitKeystorePayload {
  /**
   * password to encrypt the keystore
   */
  password: string;
  /**
   * secret item to be encrypted
   */
  mnemonic: string;

  /**
   * must be an array of non-hardened derivation path, it is used to derive the extended keys.
   * @example
   * ```
   * // the BIP44 path is `m / purpose' / coin_type' / account' / change / address_index`
   * // to initialize a BIP44 keystore, we need to provide two paths end with `change`,
   * // they also act as the parent paths. Once the parent paths are provided, the keystore
   * // will be able to derive associated child keys
   * const bip44ParentPaths = [
   *   `m/44'/309'/0'/0`, // to derive external(change: 0) addresses
   *   `m/44'/309'/0'/1`, // to derive internal(change: 1) addresses
   * ];
   * ```
   */
  paths: NonHardenedPath[];
}

export interface SignMessagePayload {
  /**
   * message be to signed
   */
  message: BytesLike;
  /**
   * derivation path of the private key, will be used to sign the message
   */
  path: HardenedPath | NonHardenedPath;
  /**
   * password to decrypt the keystore
   */
  password: PasswordProvider;
}

/**
 * checkout BIP-32 learn more about the {@link https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#extended-keys hardened key}
 */
export type HardenedPath = string;
/**
 * checkout BIP-32 learn more about the {@link https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#extended-keys non-hardened key}
 */
export type NonHardenedPath = string;
export type PasswordProvider = Provider<string>;
