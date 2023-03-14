import { createEventHub, EventHub } from './';
import browser from 'webextension-polyfill';
import { sendMessage } from 'webext-bridge';

export function createBrowserExtensionEventHub(): EventHub {
  const hub = createEventHub();

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
