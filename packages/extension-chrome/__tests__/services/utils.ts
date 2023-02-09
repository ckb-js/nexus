import { RPC } from '@ckb-lumos/rpc';
import { Cell } from '@ckb-lumos/base';
import { CkbIndexer } from '@ckb-lumos/ckb-indexer/lib/indexer';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { Promisable } from '@nexus-wallet/types/lib';
import { KeystoreService, SignMessagePayload } from '@nexus-wallet/types/lib/services/KeystoreService';
import { AddressInfo } from '../../src/services/backend/addressStorage';
import { Backend } from './../../src/services/backend/backend';

it('jest keep', async () => {});

export const createMockBackend = (payload: Partial<Backend>): Backend => {
  return {
    hasHistory: payload.hasHistory ? payload.hasHistory : async () => false,
    nodeUri: payload.nodeUri ? payload.nodeUri : '',
    indexer: payload.indexer ? payload.indexer : new CkbIndexer(''),
    rpc: payload.rpc ? payload.rpc : new RPC(''),
    getLiveCells: payload.getLiveCells
      ? payload.getLiveCells
      : function (): Promise<Cell[]> {
          return Promise.resolve([]);
        },
    getLiveCellFetcher: payload.getLiveCellFetcher
      ? payload.getLiveCellFetcher
      : () =>
          function (): Promise<Cell> {
            return Promise.resolve({} as Cell);
          },
  };
};

export const createMockKeystoreService = (payload: {
  getPublicKeyByPath: () => string;
  mockSignMessage?: (payload: SignMessagePayload) => Promisable<string>;
}): KeystoreService => ({
  hasInitialized: () => true,
  initKeystore: function (): Promisable<void> {},
  reset: function (): Promisable<void> {},
  signMessage:
    payload.mockSignMessage ||
    function (_: SignMessagePayload): Promisable<string> {
      return '0x';
    },
  getPublicKeyByPath: payload.getPublicKeyByPath,
});

export const mockAddressInfos: AddressInfo[] = new Array(50).fill(0).map((_, i) => ({
  path: `m/44'/309'/0'/0/${i}`,
  addressIndex: i,
  lock: {
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
  },
  blake160: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
  pubkey: `0x${String(i).padStart(2, '0').repeat(33)}`,
}));
