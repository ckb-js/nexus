type PromiseLiked<T> = PromiseLike<Awaited<T>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any) => any;
type StrKeyOf<T> = Extract<keyof T, string>;

/**
 * An object acts as an RPC client and an event client to communicate with Nexus
 *
 * @example
 *   import { Ownership, Events } from '@nexus-wallet/protocol';
 *   const ckb: InjectedCkb<Ownership, Events> = window.ckb;
 *   ckb.request({ method: 'wallet_enable' });
 *
 * @typeParam Rpc - The RPC methods
 * @typeParam Evt - The events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface InjectedCkb<Rpc = any, Evt = any> extends RpcClient<Rpc>, EventClient<Evt> {
  readonly version: string;
}

export interface RpcClient<T> {
  request<K extends StrKeyOf<T>>(payload: {
    method: K;
    params?: T[K] extends AnyFn ? Parameters<T[K]>[0] : never;
  }): T[K] extends AnyFn ? PromiseLiked<ReturnType<T[K]>> : never;
}

export interface EventClient<T> {
  /**
   * Subscribe to an event
   *
   * @param eventName
   * @param listener
   */
  on<K extends keyof T>(eventName: K, listener: T[K] extends AnyFn ? T[K] : never): void;

  /**
   * Remove a listener, the listener must be the same(===) with the one added
   *
   * @param eventName
   * @param listener
   */
  removeListener<K extends keyof T>(eventName: K, listener: T[K] extends AnyFn ? T[K] : never): void;
}
