export type SyncProvider<T> = T | (() => T);
export type AsyncProvider<T> = () => PromiseLike<T>;
/**
 * a compatible provider for both sync and async object
 */
export type Provider<T> = SyncProvider<T> | AsyncProvider<T>;
