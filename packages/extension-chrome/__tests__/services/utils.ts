import { Cell } from '@ckb-lumos/base';
import { CkbIndexer } from '@ckb-lumos/ckb-indexer/lib/indexer';
import { Promisable } from '@nexus-wallet/types/lib';
import { KeystoreService, SignMessagePayload } from '@nexus-wallet/types/lib/services/KeystoreService';
import { errors } from '@nexus-wallet/utils/lib';
import { Backend } from './../../src/services/backend/backend';

it('jest keep', async () => {});

export const createMockBackend = (payload: Partial<Backend>): Backend => {
  return {
    hasHistory: payload.hasHistory ? payload.hasHistory : async () => false,
    nodeUri: payload.nodeUri ? payload.nodeUri : '',
    indexer: payload.indexer ? payload.indexer : new CkbIndexer(''),
    getLiveCells: payload.getLiveCells
      ? payload.getLiveCells
      : function (): Promise<Cell[]> {
          return Promise.resolve([]);
        },
  };
};

export const createMockKeystoreService = (
  getChildPubkey: () => string,
  mockSignMessage?: (payload: SignMessagePayload) => Promisable<string>,
): KeystoreService => ({
  hasInitialized: () => true,
  initKeyStore: function (): Promisable<void> {
    errors.unimplemented();
  },
  getExtendedPublicKey: function (): Promisable<string> {
    errors.unimplemented();
  },
  signMessage:
    mockSignMessage ||
    function (payload: SignMessagePayload): Promisable<string> {
      console.log('signMessage', payload);
      return '0x';
    },
  getChildPubkey,
});
