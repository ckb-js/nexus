import { isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import { sendMessage } from '../messaging';
import { CkbProvider, InjectedCkb } from '@nexus-wallet/types';
import { asserts, LIB_VERSION } from '@nexus-wallet/utils';
import { bytes } from '@ckb-lumos/codec';

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

        async getUnusedLocks(payload) {
          return client.request('wallet_fullOwnership_getUnusedLocks', payload);
        },

        async signTransaction(payload) {
          return client.request('wallet_fullOwnership_signTransaction', payload);
        },

        async signData(payload) {
          let { data } = payload;
          if (typeof data === 'string') {
            data = /^0x([0-9a-fA-F][0-9a-fA-F])+$/i.test(data) ? data : bytes.hexify(bytes.bytifyRawString(data));
          } else {
            data = bytes.hexify(data);
          }
          return client.request('wallet_fullOwnership_signData', { ...payload, data });
        },

        async getUsedLocks(payload) {
          return client.request('wallet_fullOwnership_getUsedLocks', payload);
        },
      },
      ruleBasedOwnership: {
        async getLiveCells(payload) {
          return client.request('wallet_ruleBasedOwnership_getLiveCells', payload);
        },

        async getUnusedLocks(payload) {
          return client.request('wallet_ruleBasedOwnership_getUnusedLocks', payload);
        },

        async signTransaction(payload) {
          return client.request('wallet_ruleBasedOwnership_signTransaction', payload);
        },

        async signData(payload) {
          return client.request('wallet_ruleBasedOwnership_signData', payload);
        },

        async getUsedLocks(payload) {
          return client.request('wallet_ruleBasedOwnership_getUsedLocks', payload);
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
