import { Promisable } from '../base';

export interface KeystoreService {
  /**
   * check if the keystore is initialized
   */
  isInitialized(): Promisable<boolean>;

  initKeyStore(payload: { password: string; mnemonic: string }): Promisable<void>;
}
