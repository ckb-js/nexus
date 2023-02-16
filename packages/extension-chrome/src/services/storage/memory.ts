import { Storage } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';

interface InMemoryStorage<S> extends Storage<S> {
  getAll(): S | undefined;

  setAll(s: S): void;
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
