import type { PlatformService } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import browser from 'webextension-polyfill';
import { Endpoint } from 'webext-bridge';
import { NexusCommonErrors } from '../../errors';
import { NotificationManager } from './notificationManager';

export function createBrowserExtensionPlatformService(): PlatformService<Endpoint> {
  const notificationManager = new NotificationManager();
  return {
    async requestGrant({ url }) {
      const { messenger, window: notificationWindow } = await notificationManager.createNotificationWindow(
        {
          path: 'grant',
          metadata: { host: url },
        },
        { preventDuplicate: true },
      );
      return new Promise((resolve, reject) => {
        messenger.register('session_getRequesterAppInfo', () => {
          return { url };
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
    async requestSignTransaction({ tx, ownedLocks }) {
      const { messenger, window: notificationWindow } = await notificationManager.createNotificationWindow({
        path: 'sign-transaction',
        metadata: {},
      });

      return new Promise((resolve, reject) => {
        messenger.register('session_getUnsignedTransaction', () => {
          return {
            tx,
            ownedLocks,
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
      const { messenger, window: notificationWindow } = await notificationManager.createNotificationWindow({
        path: 'sign-data',
        metadata: {},
      });

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
            reject(NexusCommonErrors.ApproveRejected());
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
    getFavicon({ size = 32, host }) {
      const url = new URL(browser.runtime.getURL('/_favicon/'));
      url.searchParams.set('pageUrl', `https://${host}`);
      url.searchParams.set('size', size.toString());
      return url.toString();
    },
    getActiveSiteInfo: async () => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      return (
        tab && {
          faviconUrl: tab.favIconUrl,
          url: tab.url,
        }
      );
    },
  };
}

/**
 * @deprecated please migrate to {@link createBrowserExtensionPlatformService}
 */
export const createNotificationService = createBrowserExtensionPlatformService;
