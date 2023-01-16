import { Endpoint } from 'webext-bridge';
import browser from 'webextension-polyfill';
import { errors } from '@nexus-wallet/utils';
import { RpcMethods, ServerParams } from './types';
import { JSONRPCServer } from 'json-rpc-2.0';
import { createServicesFactory } from '../services';

export const server = new JSONRPCServer<ServerParams>();

export function addMethod<K extends keyof RpcMethods>(
  method: K,
  handler: (params: RpcMethods[K]['params'], context: ServerParams) => RpcMethods[K]['result'],
): void {
  server.addMethod(method, handler);
}

let servicesFactory = createServicesFactory();

export function createRpcServerParams(payload: { endpoint: Endpoint }): ServerParams {
  return {
    getRequesterAppInfo: async () => {
      const tab = await browser.tabs.get(payload.endpoint.tabId);
      if (!tab.url || !tab.favIconUrl) {
        errors.throwError(
          'It seems that there is no permission for "permissions.tab", please check if the "permissions.tab" is disabled',
        );
      }
      return { url: tab.url, favIconUrl: tab.favIconUrl };
    },

    resolveService: (k) => servicesFactory.get(k),
  };
}
