import { createEventHub, EventHub } from './';
import browser from 'webextension-polyfill';
// FIXME re-implement this by popup -> background -> content-script
import { sendMessage as popupSendMessage } from 'webext-bridge/popup';
import { sendMessage as backgroundSendMessage } from 'webext-bridge/background';

export function createBrowserExtensionEventHub(): EventHub {
  const hub = createEventHub();

  const sendMessage = (() => {
    if (typeof ServiceWorkerGlobalScope !== 'undefined' && globalThis instanceof ServiceWorkerGlobalScope) {
      return backgroundSendMessage;
    }
    return popupSendMessage;
  })();

  // send event data to content script
  hub.on('networkChanged', async (networkName) => {
    const tabs = await browser.tabs.query({});
    // TODO optimize me, only send to subscribed tabs
    tabs.forEach((tab) => {
      if (!tab.id) return;
      void sendMessage('event', { eventName: 'networkChanged', params: [networkName] }, `content-script@${tab.id}`);
    });
  });

  return hub;
}
