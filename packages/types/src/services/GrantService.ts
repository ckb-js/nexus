import { Promisable } from '../base';

export interface GrantService {
  /**
   * grant the app to access the wallet
   * @param payload
   */
  grant(payload: { host: string }): Promisable<void>;

  /**
   * check if an app has been granted
   * @param payload
   */
  getIsGranted(payload: { host: string }): Promisable<boolean>;

  /**
   * revoke granted
   * @param payload
   */
  revoke(payload: { host: string }): Promisable<void>;
}
