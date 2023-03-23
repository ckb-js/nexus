type PromiseLiked<T> = PromiseLike<Awaited<T>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any) => any;
type Assert<A, E> = A extends E ? A : never;
type AssertFn<T> = Assert<T, AnyFn>;

/**
 * An object acts as an RPC client and an event client to communicate with Nexus
 *
 * @example
 *   import { RpcMethods, Events } from '@nexus-wallet/protocol';
 *   const ckb: InjectedCkb<RpcMethods, Events> = window.ckb;
 *   ckb.request({ method: 'wallet_enable' });
 *
 * @typeParam Rpc - The RPC methods
 * @typeParam Evt - The events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface InjectedCkb<Rpc = any, Evt = any> extends RpcClient<Rpc>, EventClient<Evt> {
  readonly version: string;
}

/**
 * @typeParam T - An object of RPC methods
 */
export interface RpcClient<T> {
  request<K extends keyof T>(payload: {
    method: K;
    params?: Parameters<AssertFn<T[K]>>[0];
  }): PromiseLiked<ReturnType<AssertFn<T[K]>>>;
}

export interface EventClient<T> {
  /**
   * Subscribe to an event
   *
   * @param eventName
   * @param listener
   */
  on<K extends keyof T>(eventName: K, listener: AssertFn<T[K]>): void;

  /**
   * Remove a listener, the listener must be the same(===) with the one added
   *
   * @param eventName
   * @param listener
   */
  removeListener<K extends keyof T>(eventName: K, listener: AssertFn<T[K]>): void;
}
