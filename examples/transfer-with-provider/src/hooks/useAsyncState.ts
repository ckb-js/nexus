import { useEffect, useState } from 'react';

export function useAsyncState<T>(get: () => Promise<T>, deps?: unknown[]): T | undefined;
export function useAsyncState<T>(get: () => Promise<T>, deps: unknown[], defaultState: T): T;
export function useAsyncState<T>(get: () => Promise<T>, deps: unknown[] = [], defaultState?: T): any {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    get().then(setState);
  }, deps || []);

  return state;
}
