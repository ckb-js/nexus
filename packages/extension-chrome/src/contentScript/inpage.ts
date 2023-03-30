import { isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import * as windowMessenger from '../messaging';
import { EventEmitter } from 'eventemitter3';
import { isEventObject } from '../messaging/internal';
import { createInjectedCkb } from '../injectedCkb';
import type { RpcClient, RpcMethods } from '@nexus-wallet/types';

const client = new JSONRPCClient(async (req) => {
  const response = await windowMessenger.sendMessage('contentAndInjected', req, 'content-script');
  if (!isJSONRPCResponse(response)) {
    throw new Error(`Invalid JSON-RPC response: ${response}`);
  }
  client.receive(response);
});
const emitter = new EventEmitter();

const rpcClient: RpcClient<RpcMethods> = {
  request: async ({ method, params }) => client.request(method, params),
};

// content script -> injected script
windowMessenger.onMessage('event', (data) => {
  if (isEventObject(data)) {
    emitter.emit(data.eventName, ...(data.params ?? []));
  }
});

const injectedCkb = createInjectedCkb({ rpcClient, eventClient: emitter });
Object.assign(injectedCkb, {
  enable: async () => {
    console.warn(`[DEPRECATED]: please migrate to ckb.request({ method: "wallet_enable" })`);

    await client.request('wallet_enable', []);

    return {
      fullOwnership: {
        async getLiveCells(payload: unknown) {
          return client.request('wallet_fullOwnership_getLiveCells', payload);
        },

        async getOffChainLocks(payload: unknown) {
          return client.request('wallet_fullOwnership_getOffChainLocks', payload);
        },

        async signTransaction(payload: unknown) {
          return client.request('wallet_fullOwnership_signTransaction', payload);
        },

        async signData(payload: unknown) {
          return client.request('wallet_fullOwnership_signData', payload);
        },

        async getOnChainLocks(payload: unknown) {
          return client.request('wallet_fullOwnership_getOnChainLocks', payload);
        },
      },
      ruleBasedOwnership: {
        async getLiveCells(payload: unknown) {
          return client.request('wallet_ruleBasedOwnership_getLiveCells', payload);
        },

        async getOffChainLocks(payload: unknown) {
          return client.request('wallet_ruleBasedOwnership_getOffChainLocks', payload);
        },

        async signTransaction(payload: unknown) {
          return client.request('wallet_ruleBasedOwnership_signTransaction', payload);
        },

        async signData(payload: unknown) {
          return client.request('wallet_ruleBasedOwnership_signData', payload);
        },

        async getOnChainLocks(payload: unknown) {
          return client.request('wallet_ruleBasedOwnership_getOnChainLocks', payload);
        },
      },
      async getNetworkName() {
        return client.request('wallet_getNetworkName', []);
      },
    };
  },
});

window.ckb = Object.freeze(injectedCkb);
export {};
