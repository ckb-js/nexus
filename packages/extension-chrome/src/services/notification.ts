import type { Call, NotificationService } from '@nexus-wallet/types';
import { HexString, Script } from '@ckb-lumos/lumos';
import { createSessionMessenger, SessionMessenger } from '../messaging/session';
import { browserExtensionAdapter } from '../messaging/adapters';
import { nanoid } from 'nanoid';
import type { Browser, Windows } from 'webextension-polyfill';
import { TransactionSkeletonObject } from '@ckb-lumos/helpers';

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
  session_getUnsignedData: Call<void, { data: HexString; url: string }>;
  session_approveSignTransaction: Call<{ password: string }, void>;
  session_rejectSignTransaction: Call<void, void>;
};

type NotificationPath = 'grant' | 'sign-data' | 'sign-transaction';

const NotificationWindowSizeMap: Record<NotificationPath, { w: number; h: number }> = {
  grant: {
    w: 500,
    h: 600,
  },
  'sign-data': {
    w: 500,
    h: 772,
  },
  'sign-transaction': {
    w: 500,
    h: 772,
  },
};

async function createNotificationWindow(
  browser: Browser,
  path: NotificationPath,
): Promise<{ messenger: SessionMessenger<SessionMethods>; notificationWindow: Windows.Window }> {
  const lastFocused = await browser.windows.getLastFocused();
  const sessionId = nanoid();
  const windowSize = NotificationWindowSizeMap[path];
  const window = await browser.windows.create({
    type: 'popup',
    focused: true,
    top: lastFocused.top,
    left: lastFocused.left! + (lastFocused.width! - 360),
    width: windowSize.w,
    height: windowSize.h + 40,
    url: `notification.html#/${path}?sessionId=${sessionId}`,
  });

  const messenger = createSessionMessenger<SessionMethods>({ adapter: browserExtensionAdapter, sessionId });

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
    async requestSignTransaction({ tx }) {
      const { notificationWindow, messenger } = await createNotificationWindow(browser, 'sign-transaction');

      return new Promise((resolve, reject) => {
        messenger.register('session_getUnsignedTransaction', () => {
          return {
            tx,
            // TODO: get owned locks
            ownedLocks: [],
          };
        });

        messenger.register('session_approveSignTransaction', ({ password }) => {
          resolve({ password });
        });

        messenger.register('session_rejectSignTransaction', () => {
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

    async requestSignData(payload) {
      const { notificationWindow, messenger } = await createNotificationWindow(browser, 'sign-data');

      return new Promise((resolve, reject) => {
        messenger.register('session_getUnsignedData', () => {
          return payload;
        });

        messenger.register('session_approveSignData', ({ password }) => {
          resolve({ password });
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
