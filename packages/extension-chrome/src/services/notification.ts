import type { Call, PlatformService } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import type { HexString, Script } from '@ckb-lumos/base';
import { createSessionMessenger, SessionMessenger } from '../messaging/session';
import { browserExtensionAdapter } from '../messaging/adapters';
import { nanoid } from 'nanoid';
import type { Windows } from 'webextension-polyfill';
import browser from 'webextension-polyfill';
import { Endpoint } from 'webext-bridge';
import { NexusCommonErrors } from '../errors';

export type SessionMethods = {
  session_getRequesterAppInfo: Call<void, { url: string }>;
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
  session_getUnsignedData: Call<void, { data: HexString; url: string }>;
  session_approveSignTransaction: Call<{ password: string }, void>;
};

type NotificationPath = 'grant' | 'sign-data' | 'sign-transaction';

const NotificationWindowSizeMap: Record<NotificationPath, { w: number; h: number }> = {
  grant: {
    w: 500,
    h: 600,
  },
  'sign-data': {
    w: 500,
    h: 722,
  },
  'sign-transaction': {
    w: 500,
    h: 722,
  },
};

async function createNotificationWindow(
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
    height: windowSize.h + 28,
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
export function createBrowserExtensionPlatformService(): PlatformService<Endpoint> {
  return {
    async requestGrant({ url }) {
      const { messenger, notificationWindow } = await createNotificationWindow('grant');

      return new Promise((resolve, reject) => {
        messenger.register('session_getRequesterAppInfo', () => {
          return { url, favicon: `${new URL(url).origin}/favicon.ico` };
        });

        messenger.register('session_approveEnableWallet', () => {
          messenger.destroy();
          resolve();
        });

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notificationWindow.id) {
            messenger.destroy();
            reject(NexusCommonErrors.ApproveRejected());
          }
        });
      });
    },
    async requestSignTransaction({ tx }) {
      const { notificationWindow, messenger } = await createNotificationWindow('sign-transaction');

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

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notificationWindow.id) {
            messenger.destroy();
            reject(NexusCommonErrors.ApproveRejected());
          }
        });
      });
    },

    async requestSignData(payload) {
      const { notificationWindow, messenger } = await createNotificationWindow('sign-data');

      return new Promise((resolve, reject) => {
        messenger.register('session_getUnsignedData', () => {
          return payload;
        });

        messenger.register('session_approveSignData', ({ password }) => {
          resolve({ password });
        });

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notificationWindow.id) {
            messenger.destroy();
            reject();
          }
        });
      });
    },
    navigateToInitWallet: async () => {
      await browser.tabs.create({ url: `walletManager.html` });
    },
    getRequesterAppInfo: async (endpoint) => {
      const tab = await browser.tabs.get(endpoint.tabId);
      if (!tab.url) {
        errors.throwError(`Cannot get the site information from the request`);
      }
      return { url: tab.url };
    },
  };
}

/**
 * @deprecated please migrate to {@link createBrowserExtensionPlatformService}
 */
export const createNotificationService = createBrowserExtensionPlatformService;
