import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import type { HexString } from '@ckb-lumos/lumos';

export interface PlatformService<Sender = unknown> {
  /**
   * request user to approve for signing a transaction,
   * will return a password to decrypt keystore if user approved and input the correct password
   * @param payload
   */
  requestSignTransaction(payload: { tx: TransactionSkeletonObject }): Promise<{ password: string }>;

  /**
   * request user to approve for signing binary data,
   * will return a password to decrypt keystore if user approved and input the correct password
   * @param payload
   */
  requestSignData(payload: { data: HexString; url: string }): Promise<{ password: string }>;

  requestGrant(payload: { url: string }): Promise<void>;

  /**
   * navigate to the init wallet page, return immediately when the page is opened
   */
  navigateToInitWallet(): Promise<void>;

  /**
   * convert the requester's information into a URL,
   * which can be used to identify whether the requester is in whitelist, etc.
   * @param sender the requester's information, something like {@link https://developer.chrome.com/docs/extensions/reference/runtime/#type-MessageSender MessageSender} in Chrome extension
   * @throws if the Chrome extension permission is not granted, e.g. favicon
   */
  getRequesterAppInfo(sender: Sender): Promise<{ url: string }>;

  /**
   * get the favicon URL of the given host
   */
  getFavicon(options: { host: string; size?: number }): string;
  /**
   * get the active site(the active tab) information
   * @throws if the Chrome extension permission is not granted
   */
  getActiveSiteInfo(): Promise<{ favIconUrl?: string; url?: string } | undefined>;
}

/**
 * @deprecated please migrate to {@link PlatformService}
 */
export type NotificationService<T> = PlatformService<T>;
