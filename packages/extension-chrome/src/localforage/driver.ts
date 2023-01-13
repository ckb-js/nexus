import type LocalForageDriver from 'localforage';
export default function createDriver(): LocalForageDriver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: Record<string, any> = {};
  const storage = {
    clear: async () => {
      db = {};
      return Promise.resolve();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: async (key: string): Promise<any> => {
      console.log('get key =', key, 'value =', db[key]);
      return Promise.resolve(db[key]);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: async <T>(key: string, value: T): Promise<any> => {
      db[key] = value;
      console.log('set key =', key, 'value =', value);
      return Promise.resolve(value);
    },
    remove: async (key: string): Promise<void> => {
      console.log('remove key =', key);
      delete db[key];
      return Promise.resolve();
    },
  };

  return {
    _driver: 'mockDriver',
    // eslint-disable-next-line no-underscore-dangle
    _initStorage() {
      return Promise.resolve();
    },

    async clear(callback: () => void): Promise<void> {
      await storage.clear();
      if (callback) callback();
      return Promise.resolve();
    },

    // https://localforage.github.io/localForage/#data-api-iterate
    // iterate supports early exit by returning non undefined value inside iteratorCallback callback
    async iterate(iterator, callback) {
      const items = db;
      const keys = Object.keys(items);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const currentResult = iterator(items[key], key, index);
        if (callback) callback(null, currentResult);
        if (currentResult !== undefined) {
          return currentResult;
        }
      }
      return iterator(items[keys[keys.length - 1]], keys[keys.length - 1], keys.length - 1);
    },

    async getItem<T>(key: string, callback: (error: Error | null, result?: T | null) => void): Promise<T | null> {
      try {
        let result: T | null = db[key];
        if (!result) {
          result = null;
        }
        if (callback) callback(null, result);
        return result;
      } catch (e: unknown) {
        if (callback) callback(e as Error);
        throw e;
      }
    },

    async key(n, callback) {
      let results = db;
      const key = Object.keys(results)[n];

      if (callback) callback(null, key);
      return key;
    },

    async keys(callback) {
      let results = db;
      const keys = Object.keys(results);

      if (callback) callback(null, keys);
      return keys;
    },

    async length(callback) {
      let results = db;
      const { length } = Object.keys(results);

      if (callback) callback(null, length);
      return length;
    },

    async removeItem(key, callback) {
      await storage.remove(key);
      if (callback) callback(null);
    },

    async setItem(key, value, callback) {
      let result = await storage.set(key, value);
      if (callback) callback(null, result);
      return result;
    },
  };
}
