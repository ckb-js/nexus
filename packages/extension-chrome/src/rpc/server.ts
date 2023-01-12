import { Endpoint } from 'webext-bridge';
import browser from 'webextension-polyfill';
import { errors } from '@nexus-wallet/utils';
import { RpcMethods, ServerParams } from './types';
import { JSONRPCServer } from 'json-rpc-2.0';

export const server = new JSONRPCServer<ServerParams>();

export function addMethod<K extends keyof RpcMethods>(
  method: K,
  handler: (params: RpcMethods[K]['params'], context: ServerParams) => RpcMethods[K]['result'],
): void {
  server.addMethod(method, handler);
}

export function createRpcServerParams(payload: { endpoint: Endpoint }): ServerParams {
  return {
    async getRequesterAppInfo() {
      const tab = await browser.tabs.get(payload.endpoint.tabId);
      if (!tab.url || !tab.favIconUrl) {
        errors.throwError(
          'It seems that there is no permission for "permissions.tab", please check if the "permissions.tab" is disabled',
        );
      }
      return { url: tab.url, favIconUrl: tab.favIconUrl };
    },
  };
}
