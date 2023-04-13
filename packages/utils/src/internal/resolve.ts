/**
 * a type that can be resolved to a value
 */
type Resolvable<T> = T | PromiseLike<T> | (() => T) | (() => PromiseLike<T>);

/**
 * resolve a provider to a promise
 * @example
 * // all the following will be resolved to Promise.resolve(1)
 * resolveValue(1)
 * resolveValue(() => 1)
 * resolveValue(Promise.resolve(1))
 * resolveValue(() => Promise.resolve(1))
 * @param provider
 */
export function resolveValue<T>(provider: Resolvable<T>): Promise<T> {
  return Promise.resolve(provider instanceof Function ? provider() : provider);
}
