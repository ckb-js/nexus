import { Storage } from '@nexus-wallet/types';
import browser from 'webextension-polyfill';

export function createBrowserExtensionStorage<S>(): Storage<S> {
  return {
    getItem: (key) => {
      const k = String(key);
      return browser.storage.local.get(k).then((record) => record[k]);
    },
    removeItem: async (key) => {
      const k = String(key);
      const obj = await browser.storage.local.get(k);
      if (k in obj) {
        await browser.storage.local.remove(k);
        return true;
      }
      return false;
    },
    setItem: (key, value) => {
      return browser.storage.local.set({ [key]: value });
    },
    hasItem: async (key) => {
      const k = String(key);
      const obj = await browser.storage.local.get(k);
      return k in obj;
    },
  };
}
