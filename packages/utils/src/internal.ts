import type { Provider } from '@nexus-wallet/types/lib/services/common';
import type { Promisable } from '@nexus-wallet/types';

export function resolveProvider<T>(provider: Provider<T>): Promisable<T> {
  return provider instanceof Function ? provider() : provider;
}
