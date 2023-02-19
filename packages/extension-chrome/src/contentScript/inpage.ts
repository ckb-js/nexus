import { isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import { sendMessage } from '../messaging';
import { CkbProvider, InjectedCkb } from '@nexus-wallet/types';
import { asserts, LIB_VERSION } from '@nexus-wallet/utils';

const client = new JSONRPCClient(async (req) => {
  const response = await sendMessage('contentAndInjected', req, 'content-script');
  asserts.asserts(isJSONRPCResponse(response), `Invalid JSON-RPC response: ${response}`);
  client.receive(response);
});

const injectedCkb: InjectedCkb = {
  version: LIB_VERSION,
  async enable(): Promise<CkbProvider> {
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
          return client.request('wallet_fullOwnership_signData', payload);
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
  },
  async isEnabled(): Promise<boolean> {
    return client.request('wallet_isEnabled', null);
  },
};

// additional properties, for development purpose
Object.assign(injectedCkb, {
  request: (payload: { method: string; params: unknown }) => client.request(payload.method, payload.params),
});

window.ckb = Object.freeze(injectedCkb);
export {};
