import './_patch';
import { InjectedCkb, Storage } from '@nexus-wallet/types';
import { JSONRPCClient, JSONRPCServerMiddleware } from 'json-rpc-2.0';
import { createModulesFactory, ModuleProviderMap, ModulesFactory } from '../../src/services/factory';
import { RpcMethods } from '../../src/rpc/types';
import { mockPlatformService, mockStorage } from '../helpers';
import { createInjectedCkb, TypedEventClient, TypedRpcClient } from '../../src/injectedCkb';
import { errors } from '@nexus-wallet/utils';

const bypassMiddleware: JSONRPCServerMiddleware<unknown> = (next, ...rest) => next(...rest);

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

type MiddlewareConfig = {
  whitelist?: boolean;
  parameterValidate?: boolean;
};

type CreateServerFactory = typeof import('../../src/rpc/server').createServer;

function initCreateServerFactory(config: MiddlewareConfig): CreateServerFactory {
  let createServer!: CreateServerFactory;

  jest.isolateModules(() => {
    require('../../src/rpc/walletImpl');
    require('../../src/rpc/debugImpl');
    jest.mock('../../src/rpc/middlewares/whitelistMiddleware');
    jest.mock('../../src/rpc/middlewares/parameterValidateMiddleware');
    const whitelistMiddleware: jest.Mock = require('../../src/rpc/middlewares/whitelistMiddleware').whitelistMiddleware;
    const parameterValidateMiddleware: jest.Mock =
      require('../../src/rpc/middlewares/parameterValidateMiddleware').parameterValidateMiddleware;

    if (!config.whitelist) {
      whitelistMiddleware.mockImplementation(bypassMiddleware);
    }
    if (!config.parameterValidate) {
      parameterValidateMiddleware.mockImplementation(bypassMiddleware);
    }

    createServer = require('../../src/rpc/server').createServer;
  });

  return createServer;
}

type Payload<S, P> = Partial<ModuleProviderMap<S, P>> & {
  middlewareConfig?: MiddlewareConfig;
};

/**
 * create a test RPC server with initialized storage
 * @param payload
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestRpcServer<S = any, P = any>(payload: Payload<S, P> = {}): RpcTestHelper {
  const {
    storage = () => mockStorage as Storage<S>,
    platform = () => mockPlatformService,
    middlewareConfig = { whitelist: true, parameterValidate: true },
    ...modules
  } = payload;

  const createServer = initCreateServerFactory(middlewareConfig);

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
