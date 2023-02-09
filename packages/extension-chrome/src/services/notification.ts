import { NotificationService } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import browser from 'webextension-polyfill';

const NOTIFICATION_WIDTH = 360;
const NOTIFICATION_HEIGHT = 600;

// TODO this is a mocked notification service,
//  just demonstrating how we organize the code
export function createNotificationService(): NotificationService {
  return {
    async requestGrant({ url }) {
      const lastFocused = await browser.windows.getLastFocused();

      const notification = await browser.windows.create({
        type: 'popup',
        focused: true,
        top: lastFocused.top,
        left: lastFocused.left! + (lastFocused.width! - 360),
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        url: 'notification.html',
      });

      const notificationTabId = notification.tabs?.[0]?.id;

      type MessageListener = Parameters<typeof browser.runtime.onMessage.addListener>[0];
      const getRequesterAppInfoListener: MessageListener = (message, sender) =>
        new Promise(async (sendResponse) => {
          if (notificationTabId !== sender.tab?.id) return;
          if (message.method !== 'getRequesterAppInfo') return;

          sendResponse({ url });
          browser.runtime.onMessage.removeListener(getRequesterAppInfoListener);
        });

      return new Promise((resolve, reject) => {
        const userHasEnabledWalletListener: MessageListener = (message, sender) =>
          new Promise((sendResponse) => {
            if (notificationTabId !== sender.tab?.id) return;
            if (message.method !== 'userHasEnabledWallet') return;

            sendResponse(void 0);
            browser.runtime.onMessage.removeListener(userHasEnabledWalletListener);
            resolve();
          });

        browser.runtime.onMessage.addListener(getRequesterAppInfoListener);
        browser.runtime.onMessage.addListener(userHasEnabledWalletListener);

        browser.windows.onRemoved.addListener((windowId) => {
          if (windowId === notification.id) {
            browser.runtime.onMessage.removeListener(getRequesterAppInfoListener);
            browser.runtime.onMessage.removeListener(userHasEnabledWalletListener);
            reject(errors);
          }
        });
      });
    },
    requestSignTransaction() {
      errors.unimplemented();
    },
    requestSignData() {
      errors.unimplemented();
    },
  };
}
