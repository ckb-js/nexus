import { assert, asyncSleep } from '@nexus-wallet/utils';
import type { Events, InjectedCkb, RpcMethods } from '@nexus-wallet/protocol';

declare global {
  interface Window {
    ckb: InjectedCkb<RpcMethods, Events>;
  }
}

const DEFAULT_TIMEOUT = 3000;
const DEFAULT_DETECT_INTERVAL = 50;

/**
 * Detect if the ckb object is injected to global, if not, throw an error.
 * @example
 *   const ckb = await detectCkb()
 *   ckb.request({ method: 'wallet_enable' })
 */
export async function detectCkb<M = RpcMethods, E = Events>(
  options: { detectScope?: object; timeout?: number } = {},
): Promise<InjectedCkb<M, E>> {
  const detectScope: { ckb?: InjectedCkb } = (() => {
    if (options?.detectScope) return options.detectScope;
    if (typeof globalThis !== 'undefined') return globalThis;

    throw new Error('Cannot detect ckb object, "detectCkb" must be called in browser environment');
  })();

  // retry to detect ckb object is injected to the scope
  let retryTime = 0;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const interval = DEFAULT_DETECT_INTERVAL;
  while (!detectScope.ckb && retryTime < timeout) {
    await asyncSleep(interval);
    retryTime += interval;
  }

  assert(detectScope.ckb, 'Cannot detect ckb object, please install the extension first');
  return detectScope.ckb;
}
