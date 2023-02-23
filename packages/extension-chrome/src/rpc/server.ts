import { RpcMethods, ServerParams } from './types';
import { ModulesFactory } from '../services';
import { JSONRPCServer } from 'json-rpc-2.0';
import { whitelistMiddleware } from './middlewares/whitelistMiddleware';
import { createLogger } from '@nexus-wallet/utils';

export const methods: Record<string, (...args: unknown[]) => unknown> = {};
export const logger = createLogger();

export function addMethod<K extends keyof RpcMethods>(
  method: K,
  handler: (param: RpcMethods[K]['params'], context: ServerParams) => RpcMethods[K]['result'],
): void {
  Object.assign(methods, { [method]: handler });
}

/**
 * this method should be called after all methods has been registered
 * so if you want to createServer, you should call {@link addMethod} first
 * @param factory
 */
export function createServer<Endpoint>(factory: ModulesFactory): {
  server: JSONRPCServer<ServerParams>;
  createServerParams: (endpoint: Endpoint) => ServerParams;
} {
  const server = new JSONRPCServer<ServerParams>();
  server.applyMiddleware(whitelistMiddleware);

  logger.info('Methods has been registered: ', Object.keys(methods));

  Object.entries(methods).forEach(([method, handler]) => server.addMethod(method, handler));
  return { server, createServerParams: (endpoint) => createRpcServerParams({ endpoint, factory }) };
}

export function createRpcServerParams<Endpoint>({
  endpoint,
  factory,
}: {
  endpoint: Endpoint;
  factory: ModulesFactory;
}): ServerParams {
  return {
    getRequesterAppInfo: async () => {
      const platform = factory.get('platformService');
      return platform.getRequesterAppInfo(endpoint);
    },

    resolveService: (k) => factory.get(k),
  };
}
