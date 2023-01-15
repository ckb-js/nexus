import { Promisable } from './base';

/**
 * key-value storage
 */
export interface Storage<Schema> {
  hasItem<K extends keyof Schema>(key: K): Promisable<boolean>;
  getItem<K extends keyof Schema>(key: K): Promisable<Schema[K] | undefined>;
  removeItem<K extends keyof Schema>(key: K): Promisable<boolean>;
  setItem<K extends keyof Schema>(key: K, value: Schema[K]): Promisable<void>;
}
