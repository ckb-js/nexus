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
   * Only non-hardened path can be used to generate extended public key
   * @param payload
   */
  initKeyStore(payload: InitKeyStorePayload): Promisable<void>;

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
export interface InitKeyStorePayload {
  /**
   * password to encrypt the keystore
   */
  password: string;
  /**
   * secret item to be encrypted
   */
  mnemonic: string;

  /**
   * non-hardened derivation path,
   * the corresponding public key will be stored in plain text,
   * for example, the BIP-44 path `m / 44'/ 309'/ 0'/ 0 / 0` will store the public key of
   * `m / 44' / 309' / 0' / 0` (external) and `m/44'/ 309'/ 0'/ 1` (internal) in plain text
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
