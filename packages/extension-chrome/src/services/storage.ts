import { Storage } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import browser from 'webextension-polyfill';

interface InMemoryStorage<S> extends Storage<S> {
  getAll(): S | undefined;

  setAll(s: S): void;
}

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

export function createInMemoryStorage<S>(): InMemoryStorage<S> {
  const store = new Map();

  return {
    getItem(key) {
      const value = store.get(key);
      if (!value) return value;
      // deep clone to avoid the value being modified by the caller
      return JSON.parse(JSON.stringify(value));
    },
    hasItem(key) {
      return store.has(key);
    },
    removeItem(key) {
      return store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
    getAll() {
      return Object.fromEntries(store.entries());
    },
    setAll(s) {
      if (!s) errors.throwError(`The storage cannot be set to ${s}`);

      Object.entries(s).forEach(([key, value]) => {
        store.set(key, value);
      });
    },
  };
}
