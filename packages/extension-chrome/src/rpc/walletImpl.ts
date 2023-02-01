import { addMethod } from './server';
import browser from 'webextension-polyfill';
import { errors } from '@nexus-wallet/utils';

const NOTIFICATION_WIDTH = 360;
const NOTIFICATION_HEIGHT = 600;

addMethod('wallet_enable', async (_, { getRequesterAppInfo }) => {
  const lastFocused = await browser.windows.getLastFocused();

  const notification = await browser.windows.create({
    type: 'popup',
    focused: true,
    top: lastFocused.top,
    left: lastFocused.left! + (lastFocused.width! - 360),
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    url: 'notification.html#/grant',
  });

  const notificationTabId = notification.tabs?.[0]?.id;

  type MessageListener = Parameters<typeof browser.runtime.onMessage.addListener>[0];
  const getRequesterAppInfoListener: MessageListener = (message, sender) =>
    new Promise(async (sendResponse) => {
      if (notificationTabId !== sender.tab?.id) return;
      if (message.method !== 'getRequesterAppInfo') return;

      const { url } = await getRequesterAppInfo();
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
});
