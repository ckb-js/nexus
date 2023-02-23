import type { Call, NotificationService } from '@nexus-wallet/types';
import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import type { HexString, Script } from '@ckb-lumos/base';
import { createSessionMessenger } from '../messaging/session';
import { browserExtensionAdapter } from '../messaging/adapters';
import { nanoid } from 'nanoid';
import type { Browser } from 'webextension-polyfill';

export type SessionMethods = {
  session_getRequesterAppInfo: Call<void, { url: string; favicon: string }>;
  session_approveEnableWallet: Call<void, void>;

  /**
   * get a ready-to-sign transaction
   * the input/output scripts of the transaction should be highlighted if they are owned by the wallet
   */
  session_getUnsignedTransaction: Call<void, { tx: TransactionSkeletonObject; ownedLocks: Script[] }>;
  session_approveSignData: Call<{ password: string }, void>;

  /**
   * get bytes to be signed, the return data should detect if it can be converted to utf8 string,
   * if so, return the utf8 string, otherwise return the hex string
   */
  session_getUnsignedData: Call<void, { data: HexString | string }>;
  session_approveSignTransaction: Call<{ password: string }, void>;
};

const NOTIFICATION_WIDTH = 500;
const NOTIFICATION_HEIGHT = 640;

// TODO this is a mocked notification service,
//  just demonstrating how we organize the code
export function createNotificationService({ browser }: { browser: Browser }): NotificationService {
  return {
    async requestGrant({ url }) {
      const lastFocused = await browser.windows.getLastFocused();
      const sessionId = nanoid();

      const notification = await browser.windows.create({
        type: 'popup',
        focused: true,
        top: lastFocused.top,
        left: lastFocused.left! + (lastFocused.width! - 360),
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        url: `notification.html#/grant?sessionId=${sessionId}`,
      });

      const messenger = createSessionMessenger<SessionMethods>({ adapter: browserExtensionAdapter, sessionId });

      return new Promise((resolve, reject) => {
        messenger.register('session_getRequesterAppInfo', () => {
          // TODO: favicon from url
          return { url, favicon: `${new URL(url).origin}/favicon.ico` };
        });

        messenger.register('session_approveEnableWallet', () => {
          messenger.destroy();
          resolve();
        });

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notification.id) {
            messenger.destroy();
            reject();
          }
        });
      });
    },
    requestSignTransaction() {
      return Promise.resolve({ password: 'abcd1234' });
    },
    requestSignData() {
      return Promise.resolve({ password: 'abcd1234' });
    },
  };
}
