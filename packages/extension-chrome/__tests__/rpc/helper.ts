import './_patch';
import { InjectedCkb, Storage } from '@nexus-wallet/types';
import { JSONRPCClient } from 'json-rpc-2.0';
import { createServer } from '../../src/rpc';
import { createModulesFactory, ModuleProviderMap, ModulesFactory } from '../../src/services/factory';
import { RpcMethods } from '../../src/rpc/types';
import { mockPlatformService, mockStorage } from '../helpers';
import '../../src/rpc/debugImpl';
import '../../src/rpc/walletImpl';
import { createInjectedCkb, TypedEventClient, TypedRpcClient } from '../../src/injectedCkb';
import { errors } from '@nexus-wallet/utils';

// TODO: make parameter validation configurable
jest.mock('../../src/rpc/schema');

export interface RpcTestHelper {
  /**
   * @deprecated please migrate to {@link InjectedCkb.request}
   * @param method
   * @param params
   */
  request<Method extends keyof RpcMethods>(
    method: Method,
    params?: RpcMethods[Method]['params'],
  ): RpcMethods[Method]['result'];

  ckb: InjectedCkb<TypedRpcClient, TypedEventClient>;

  factory: ModulesFactory;
}

/**
 * create a test RPC server with initialized storage
 * @param payload
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestRpcServer<S = any, P = any>(payload: Partial<ModuleProviderMap<S, P>> = {}): RpcTestHelper {
  const { storage = () => mockStorage as Storage<S>, platform = () => mockPlatformService, ...modules } = payload;

  const factory = createModulesFactory({ storage, platform, ...modules });
  const server = createServer(factory);
  const eventHub = factory.get('eventHub');

  const client = new JSONRPCClient(async (req) => {
    const response = await server.handleRequest({ request: req, sender: null });
    client.receive(response!);
  });

  const ckb = createInjectedCkb({
    rpcClient: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: async (payload: any) => client.request(payload.method, payload.params),
    },
    eventClient: {
      on: eventHub.on.bind(eventHub),
      removeListener: errors.unimplemented,
    },
  });

  const request: RpcTestHelper['request'] = (method, params) => {
    return client.request(String(method), params);
  };

  return { request, factory, ckb };
}
