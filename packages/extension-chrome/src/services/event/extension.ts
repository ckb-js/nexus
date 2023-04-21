import { createEventHub, EventHub } from './';
import browser from 'webextension-polyfill';

export function createBrowserExtensionEventHub(): EventHub {
  const hub = createEventHub();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sendMessage: (...args: any[]) => any = () => {};

  // FIXME re-implement this by popup -> background -> content-script
  if (typeof ServiceWorkerGlobalScope !== 'undefined' && globalThis instanceof ServiceWorkerGlobalScope) {
    void import('webext-bridge/background').then((module) => {
      sendMessage = module.sendMessage;
    });
  } else {
    void import('webext-bridge/popup').then((module) => {
      sendMessage = module.sendMessage;
    });
  }

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
