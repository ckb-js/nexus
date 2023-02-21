import type { Call, NotificationService } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import type { HexString, Script } from '@ckb-lumos/base';
import { createSessionMessenger, SessionMessenger } from '../messaging/session';
import { browserExtensionAdapter } from '../messaging/adapters';
import { nanoid } from 'nanoid';
import type { Browser, Windows } from 'webextension-polyfill';

export type SessionMethods = {
  session_getRequesterAppInfo: Call<void, { url: string; favicon: string }>;
  session_approveEnableWallet: Call<void, void>;

  /**
   * get a ready-to-sign transaction
   * the input/output scripts of the transaction should be highlighted if they are owned by the wallet
   */
  session_getUnsignedTransaction: Call<void, { tx: TransactionSkeletonObject; ownedLocks: Script[] }>;
  session_approveSignData: Call<{ password: string }, void>;
  session_rejectSignData: Call<void, void>;

  /**
   * get bytes to be signed, the return data should detect if it can be converted to utf8 string,
   * if so, return the utf8 string, otherwise return the hex string
   */
  session_getUnsignedData: Call<void, { data: HexString | string; url: string }>;
  session_approveSignTransaction: Call<{ password: string }, void>;

  /**
   * Check the password. `true` when password is correct
   */
  session_checkPassword: Call<{ password: string }, boolean>;
};

const NOTIFICATION_WIDTH = 500;
const NOTIFICATION_HEIGHT = 640;

type NotificationPath = 'grant' | 'sign-data' | 'sign-transaction';
async function createNotificationWindow(
  browser: Browser,
  path: NotificationPath,
): Promise<{ messenger: SessionMessenger; notificationWindow: Windows.Window }> {
  const lastFocused = await browser.windows.getLastFocused();
  const sessionId = nanoid();
  const window = await browser.windows.create({
    type: 'popup',
    focused: true,
    top: lastFocused.top,
    left: lastFocused.left! + (lastFocused.width! - 360),
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    url: `notification.html#/${path}?sessionId=${sessionId}`,
  });

  const messenger = createSessionMessenger({ adapter: browserExtensionAdapter, sessionId });

  return {
    notificationWindow: window,
    messenger,
  };
}

// TODO this is a mocked notification service,
//  just demonstrating how we organize the code
export function createNotificationService({ browser }: { browser: Browser }): NotificationService {
  return {
    async requestGrant({ url }) {
      const { messenger, notificationWindow } = await createNotificationWindow(browser, 'grant');

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
          if (windowId === notificationWindow.id) {
            messenger.destroy();
            reject();
          }
        });
      });
    },
    requestSignTransaction() {
      errors.unimplemented();
    },
    async requestSignData(payload) {
      const { notificationWindow, messenger } = await createNotificationWindow(browser, 'sign-data');

      return new Promise((resolve, reject) => {
        messenger.register('session_getUnsignedData', () => payload);

        messenger.register('session_approveSignData', () => {
          resolve({ password: 'mooooock data' });
        });

        messenger.register('session_rejectSignData', () => {
          reject();
        });

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notificationWindow.id) {
            messenger.destroy();
            reject();
          }
        });
      });
    },
  };
}
