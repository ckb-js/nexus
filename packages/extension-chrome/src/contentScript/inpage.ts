import { isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import * as windowMessenger from '../messaging';
import { asserts } from '@nexus-wallet/utils';
import { EventEmitter } from 'eventemitter3';
import { isEventObject } from '../messaging/internal';
import { createInjectedCkb, TypedEventClient, TypedRpcClient } from '../injectedCkb';

const client = new JSONRPCClient(async (req) => {
  const response = await windowMessenger.sendMessage('contentAndInjected', req, 'content-script');
  asserts.asserts(isJSONRPCResponse(response), `Invalid JSON-RPC response: ${response}`);
  client.receive(response);
});
const emitter = new EventEmitter();

const rpcClient: TypedRpcClient = {
  request: async ({ method, params }) => client.request(String(method), params),
};

// content script -> injected script
windowMessenger.onMessage('event', (data) => {
  if (isEventObject(data)) {
    emitter.emit(data.eventName, ...(data.params ?? []));
  }
});

const injectedCkb = createInjectedCkb({ rpcClient, eventClient: emitter as TypedEventClient });
injectedCkb.enable = async () => {
  console.warn('[DEPRECATED]: please migrate to ckb.request');

  await client.request('wallet_enable', []);

  return {
    fullOwnership: {
      async getLiveCells(payload) {
        return client.request('wallet_fullOwnership_getLiveCells', payload);
      },

      async getOffChainLocks(payload) {
        return client.request('wallet_fullOwnership_getOffChainLocks', payload);
      },

      async signTransaction(payload) {
        return client.request('wallet_fullOwnership_signTransaction', payload);
      },

      async signData(payload) {
        return client.request('wallet_fullOwnership_signData', { ...payload });
      },

      async getOnChainLocks(payload) {
        return client.request('wallet_fullOwnership_getOnChainLocks', payload);
      },
    },
    ruleBasedOwnership: {
      async getLiveCells(payload) {
        return client.request('wallet_ruleBasedOwnership_getLiveCells', payload);
      },

      async getOffChainLocks(payload) {
        return client.request('wallet_ruleBasedOwnership_getOffChainLocks', payload);
      },

      async signTransaction(payload) {
        return client.request('wallet_ruleBasedOwnership_signTransaction', payload);
      },

      async signData(payload) {
        return client.request('wallet_ruleBasedOwnership_signData', payload);
      },

      async getOnChainLocks(payload) {
        return client.request('wallet_ruleBasedOwnership_getOnChainLocks', payload);
      },
    },
    async getNetworkName() {
      return client.request('wallet_getNetworkName', []);
    },
  };
};

window.ckb = Object.freeze(injectedCkb);
export {};
