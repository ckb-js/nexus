import { InjectedCkb } from '@nexus-wallet/protocol';
import { EventEmitter } from 'eventemitter3';
import { LIB_VERSION } from '@nexus-wallet/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
type StrKeyOf<T> = Extract<keyof T, string>;
type CallMap<T> = { [key in keyof T]: T[key] extends AnyFn ? T[key] : never };

interface MockInjectedCkb<Rpc, Evt> extends InjectedCkb<Rpc, Evt> {
  addMethod: <K extends StrKeyOf<Rpc>>(
    method: K,
    handler: (params: Parameters<CallMap<Rpc>[K]>[0]) => ReturnType<CallMap<Rpc>[K]>,
  ) => this;
  emit: <K extends StrKeyOf<Evt>>(event: K, ...args: Parameters<CallMap<Evt>[K]>) => void;
}

export function mockInjectedCkb<Rpc extends object = object, Evt extends object = object>(): MockInjectedCkb<Rpc, Evt> {
  const handlers = new Map<string, AnyFn>();
  const emitter = new EventEmitter();

  const injectedCkb: MockInjectedCkb<Rpc, Evt> = {
    addMethod: (method, handler) => {
      handlers.set(method, handler);
      return injectedCkb;
    },

    request: async ({ method, params }) => {
      const handler = handlers.get(String(method));
      if (!handler) throw new Error(`Missing handler for method ${String(method)}`);
      return handler(params);
    },

    emit: (eventName, ...args) => {
      emitter.emit(eventName, ...args);
    },
    on: (eventName, listener) => {
      emitter.on(String(eventName), listener);
    },
    removeListener: (eventName, listener) => {
      emitter.removeListener(String(eventName), listener);
    },

    version: LIB_VERSION,
  };
  return injectedCkb;
}
