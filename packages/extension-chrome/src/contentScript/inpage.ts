import { JSONRPCClient } from 'json-rpc-2.0';
import { sendToContent } from '../messaging';
import { CkbProvider, InjectedCkb } from '@nexus-wallet/types';
import { LIB_VERSION } from '@nexus-wallet/utils';

declare global {
  interface Ckb {
    version: string;
  }

  interface Window {
    ckb: Ckb;
  }
}

const client = new JSONRPCClient(async (req) => {
  client.receive(await sendToContent(req));
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
          return client.request('wallet_fullOwnership_signData', payload);
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

window.ckb = Object.freeze(injectedCkb);
export {};
