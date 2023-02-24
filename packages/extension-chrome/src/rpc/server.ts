import { RpcMethods, ServerParams } from './types';
import { ModulesFactory } from '../services';
import { JSONRPCRequest, JSONRPCResponse, JSONRPCServer } from 'json-rpc-2.0';
import { whitelistMiddleware } from './middlewares/whitelistMiddleware';
import { ProbeTask } from '../services/ownership/probeTask';
import { BackendProvider } from '../services/ownership/backend';
import { createLogger } from '@nexus-wallet/utils';

export const methods: Record<string, (...args: unknown[]) => unknown> = {};
export const logger = createLogger();

export function addMethod<K extends keyof RpcMethods>(
  method: K,
  handler: (param: RpcMethods[K]['params'], context: ServerParams) => RpcMethods[K]['result'],
): void {
  Object.assign(methods, { [method]: handler });
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

  logger.info('Methods has been registered: ', Object.keys(methods));

  Object.entries(methods).forEach(([method, handler]) => server.addMethod(method, handler));

  void probeRun(factory);
  return {
    handleRequest: ({ request, sender }) => server.receive(request, createRpcServerParams({ sender, factory })),
  };
}

async function probeRun(factory: ModulesFactory) {
  const keystoreService = factory.get('keystoreService');
  const storage = factory.get('storage');
  if (!keystoreService || !storage) return;
  console.log('wallet already initialized, start probe task...');
  ProbeTask.getInstance({
    keystoreService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage: storage as any,
    backend: BackendProvider.getDefaultBackend(),
  }).run();
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
