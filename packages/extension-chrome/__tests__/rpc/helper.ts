import './_patch';
import { Storage } from '@nexus-wallet/types';
import { JSONRPCClient } from 'json-rpc-2.0';
import { createServer } from '../../src/rpc';
import { createModulesFactory, ModuleProviderMap, ModulesFactory } from '../../src/services/factory';
import { RpcMethods } from '../../src/rpc/types';
import { mockPlatformService, mockStorage } from '../helpers';
import '../../src/rpc/debugImpl';
import '../../src/rpc/walletImpl';

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
export function createTestRpcServer<S = any, P = any>(payload: Partial<ModuleProviderMap<S, P>> = {}): RpcTestHelper {
  const storage = payload.storage || (() => mockStorage as Storage<S>);
  const platform = payload.platform || (() => mockPlatformService);
  const factory = createModulesFactory({ storage, platform });
  const { server, createServerParams } = createServer(factory);

  const client = new JSONRPCClient(async (req) => {
    const response = await server.receive(req, createServerParams(null));
    client.receive(response!);
  });

  const request: RpcTestHelper['request'] = (method, params) => {
    return client.request(String(method), params);
  };

  return { request, factory };
}
