import { RpcMethods, ServerParams } from './types';
import { ModulesFactory } from '../services';
import { JSONRPCRequest, JSONRPCResponse, JSONRPCServer } from 'json-rpc-2.0';
import { whitelistMiddleware } from './middlewares/whitelistMiddleware';
import { createLogger } from '@nexus-wallet/utils';
import { getMethodSchema } from './schema';

export const methods: Record<string, (...args: unknown[]) => unknown> = {};
export const logger = createLogger();

export function addMethod<K extends keyof RpcMethods>(
  method: K,
  handler: (param: RpcMethods[K]['params'], context: ServerParams) => RpcMethods[K]['result'],
): void {
  const schema = getMethodSchema(method);
  Object.assign(methods, { [method]: !!schema ? schema.implement(handler) : handler });
}

interface NexusRpcServer<Sender> {
  handleRequest: (payload: { request: JSONRPCRequest; sender: Sender }) => PromiseLike<JSONRPCResponse | null>;
}

/**
 * this method should be called after all methods has been registered
 * so if you want to createServer, you should call {@link addMethod} first.
 * Checkout {@link PlatformService.getRequesterAppInfo} for more details about the <Sender>
 * @see {@link PlatformService.getRequesterAppInfo}
 * @param factory
 */
export function createServer<Sender>(factory: ModulesFactory): NexusRpcServer<Sender> {
  const server = new JSONRPCServer<ServerParams>();
  server.applyMiddleware(whitelistMiddleware);

  const registered = Object.keys(methods);
  logger.info('Methods has been registered: ', registered);
  /* istanbul ignore if */
  if (registered.length === 0) {
    logger.warn(
      'No methods has been registered, please check if you have imported rpc implementation modules, e.g. walletImpl, debugImpl, etc.',
    );
  }
  Object.entries(methods).forEach(([method, handler]) => server.addMethod(method, handler));

  return {
    handleRequest: ({ request, sender }) => server.receive(request, createRpcServerParams({ sender, factory })),
  };
}

export function createRpcServerParams<Sender>({
  sender,
  factory,
}: {
  sender: Sender;
  factory: ModulesFactory;
}): ServerParams {
  return {
    getRequesterAppInfo: async () => {
      const platform = factory.get('platformService');
      return platform.getRequesterAppInfo(sender);
    },

    resolveService: (k) => factory.get(k),
  };
}
