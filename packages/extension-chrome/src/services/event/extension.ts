import { createEventHub, EventHub } from './';
import browser from 'webextension-polyfill';
// eslint-disable-next-line import/no-unresolved
import { sendMessage } from 'webext-bridge/background';

export function createBrowserExtensionEventHub(): EventHub {
  const hub = createEventHub();

  // send event data to content script
  hub.on('networkChanged', async (networkName) => {
    const tabs = await browser.tabs.query({});
    // TODO optimize me, only send to subscribed tabs
    tabs.forEach((tab) => {
      if (!tab.id) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      void sendMessage('event', { eventName: 'networkChanged', params: [networkName] }, `content-script@${tab.id}`);
    });
  });

  return hub;
}
