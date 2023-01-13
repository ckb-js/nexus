import type LocalForageDriver from 'localforage';
export function createDriver(): LocalForageDriver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: Record<string, any> = {};
  const storage = {
    clear: async () => {
      db = {};
      return Promise.resolve();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: async (key: string): Promise<any> => {
      console.debug('get key =', key, 'value =', db[key]);
      return Promise.resolve(db[key]);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: async <T>(key: string, value: T): Promise<any> => {
      db[key] = value;
      console.debug('set key =', key, 'value =', value);
      return Promise.resolve(value);
    },
    remove: async (key: string): Promise<void> => {
      console.debug('remove key =', key);
      delete db[key];
      return Promise.resolve();
    },
  };

  return {
    _driver: 'memDriver',
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
      let currentResult: ReturnType<typeof iterator> = iterator(items[keys[0]], keys[0], 0);
      if (keys.length > 1) {
        for (let index = 1; index < keys.length; index++) {
          const key = keys[index];
          currentResult = iterator(items[key], key, index);
          if (callback) callback(null, currentResult);
          if (currentResult !== undefined) {
            return currentResult;
          }
        }
      }
      return currentResult;
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
      const keys = Object.keys(results);

      if (callback) callback(null, keys.length);
      return keys.length;
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
