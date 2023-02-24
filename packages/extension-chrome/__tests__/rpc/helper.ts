import './_patch';
import { Storage } from '@nexus-wallet/types';
import { JSONRPCClient } from 'json-rpc-2.0';
import { createServer } from '../../src/rpc';
import { createModulesFactory, ModuleProviderMap, ModulesFactory } from '../../src/services/factory';
import { RpcMethods } from '../../src/rpc/types';
import { mockPlatformService, mockStorage } from '../helpers';
import '../../src/rpc/debugImpl';
import '../../src/rpc/walletImpl';
import { ProbeTask } from '../../src/services/ownership/probeTask';
import { BackendProvider } from '../../src/services/ownership/backend';

export interface RpcTestHelper {
  request<Method extends keyof RpcMethods>(
    method: Method,
    params?: RpcMethods[Method]['params'],
  ): RpcMethods[Method]['result'];

  factory: ModulesFactory;
}

/**
 * create a test RPC server with initialized storage
 * @param payload
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestRpcServer<S = any, P = any>(
  payload: Partial<ModuleProviderMap<S, P>> = {},
): RpcTestHelper & { probeStop: () => void } {
  const storage = payload.storage || (() => mockStorage as Storage<S>);
  const platform = payload.platform || (() => mockPlatformService);
  const factory = createModulesFactory({ storage, platform });
  const server = createServer(factory);

  const client = new JSONRPCClient(async (req) => {
    const response = await server.handleRequest({ request: req, sender: null });
    client.receive(response!);
  });

  const request: RpcTestHelper['request'] = (method, params) => {
    return client.request(String(method), params);
  };

  const probeStop = () => {
    const keystoreService = factory.get('keystoreService');
    const storage = factory.get('storage');
    if (!keystoreService || !storage) return;
    console.log('wallet already initialized, stop probe task...');
    ProbeTask.getInstance({
      keystoreService,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: storage as any,
      backend: BackendProvider.getDefaultBackend(),
    }).stop();
  };

  return { request, factory, probeStop };
}
