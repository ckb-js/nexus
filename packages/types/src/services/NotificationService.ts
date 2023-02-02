import { BytesLike } from '@ckb-lumos/codec';
import { Transaction } from '@ckb-lumos/lumos';

export interface NotificationService {
  /**
   * request user to approve for signing a transaction,
   * will return a password to decrypt keystore if user approved and input the correct password
   * @param payload
   */
  requestSignTransaction(payload: { tx: Transaction }): Promise<{ password: string }>;

  /**
   * request user to approve for signing binary data,
   * will return a password to decrypt keystore if user approved and input the correct password
   * @param payload
   */
  requestSignData(payload: { data: BytesLike }): Promise<{ password: string }>;

  requestGrant(payload: { url: string }): Promise<void>;
}
