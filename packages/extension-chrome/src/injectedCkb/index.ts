import { InjectedCkb } from '@nexus-wallet/types';
import { LIB_VERSION } from '@nexus-wallet/utils';
import { RpcMethods } from '../rpc/types';
import { EventMap } from '../services/event';
import { EventClient, RpcClient } from '@nexus-wallet/types/lib/injected';

type JsonRpcRequest<M extends string | number = string, P = unknown> = {
  method: M;
  params?: P;
};

type KeyOf<T> = Extract<keyof T, string>;

export interface TypedRpcClient extends RpcClient {
  request<M extends KeyOf<RpcMethods>>(payload: JsonRpcRequest<M, RpcMethods[M]['params']>): RpcMethods[M]['result'];
  // uncomment me when we have a better way to handle unknown
  // request(payload: JsonRpcRequest): Promise<unknown>;
}

export interface TypedEventClient extends EventClient {
  on<E extends keyof EventMap>(event: E, listener: EventMap[E]): void;
  removeListener<E extends keyof EventMap>(event: E, listener: (...args: Parameters<EventMap[E]>) => void): void;
}

export function createInjectedCkb({
  rpcClient,
  eventClient,
}: {
  rpcClient: TypedRpcClient;
  eventClient: TypedEventClient;
}): InjectedCkb<TypedRpcClient, TypedEventClient> {
  return {
    version: LIB_VERSION,
    request: rpcClient.request.bind(rpcClient),
    on: eventClient.on.bind(eventClient),
    removeListener: eventClient.removeListener.bind(eventClient),
    enable: /* istanbul ignore next */ () => {
      throw new Error('Deprecated, please migrate to request');
    },
    isEnabled: /* istanbul ignore next */ () => {
      throw new Error('Deprecated, please migrate to request');
    },
  };
}
