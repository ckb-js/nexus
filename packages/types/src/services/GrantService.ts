import { Promisable } from '../base';

export interface GrantService {
  /**
   * grant the app to access the wallet
   * @param payload
   */
  grant(payload: { url: string }): Promisable<void>;

  /**
   * check if an app has been granted
   * @param payload
   */
  getIsGranted(payload: { url: string }): Promisable<boolean>;
}
