import { FullLocksAndPointer, RuleBasedLocksAndPointer } from '../../../../src/services/ownership/types';
import { RPC } from '@ckb-lumos/rpc';
import { RPC as IndexerRPC } from '@ckb-lumos/ckb-indexer/lib/rpc';
import { Cell } from '@ckb-lumos/base';
import { CkbIndexer } from '@ckb-lumos/ckb-indexer/lib/indexer';
import { Promisable } from '@nexus-wallet/types/lib';
import { KeystoreService, SignMessagePayload } from '@nexus-wallet/types/lib/services/KeystoreService';
import { LockInfo } from '../../../../src/services/ownership/types';
import { Backend } from '../../../../src/services/ownership/backend';

it('jest keep', async () => {});

export const createMockBackend = (payload: Partial<Backend>): Backend => {
  return {
    hasHistory: payload.hasHistory ? payload.hasHistory : async () => false,
    nodeUri: payload.nodeUri ? payload.nodeUri : '',
    indexer: payload.indexer ? payload.indexer : new CkbIndexer(''),
    indexerRPC: payload.indexerRPC ? payload.indexerRPC : new IndexerRPC(''),
    rpc: payload.rpc ? payload.rpc : new RPC(''),
    getNextLiveCellWithCursor: () => {
      return Promise.resolve({ cursor: '', cells: [] });
    },
    getLiveCellFetcher: payload.getLiveCellFetcher
      ? payload.getLiveCellFetcher
      : () =>
          function (): Promise<Cell> {
            return Promise.resolve({} as Cell);
          },
  };
};

export const createMockKeystoreService = (payload: Partial<KeystoreService>): KeystoreService => ({
  hasInitialized: () => true,
  initKeystore: function (): Promisable<void> {},
  reset: function (): Promisable<void> {},
  signMessage:
    payload.signMessage ||
    function (_: SignMessagePayload): Promisable<string> {
      return '0x';
    },
  getPublicKeyByPath: payload.getPublicKeyByPath
    ? payload.getPublicKeyByPath
    : function (): Promise<string> {
        return Promise.resolve('');
      },
});

export const mockFullOwnershipLockInfosExternal: LockInfo[] = new Array(100).fill(0).flatMap((_, i) => {
  const lock = {
    args: '0x',
    codeHash: '0x',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/44'/309'/0'/0`,
    index: i,
    lock,
    blake160: '',
    publicKey: '0x000000000000000000000000000000000000000000000000000000000000000000',
    lockHash: '0x',
    network: 'ckb_testnet' as const,
    onchain: false,
  };
});
export const mockFullOwnershipLockInfosChange: LockInfo[] = new Array(100).fill(0).flatMap((_, i) => {
  const lock = {
    args: '0x',
    codeHash: '0x',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/44'/309'/0'/1`,
    index: i,
    lock,
    blake160: '',
    publicKey: '0x000000000000000000000000000000000000000000000000000000000000000000',
    lockHash: '0x',
    network: 'ckb_testnet' as const,
    onchain: false,
  };
});

/**
 * 100 external addresses index 0..99
 *
 * 100 change addresses index 100..199
 */
export const mockFullOwnershipLockInfos = [...mockFullOwnershipLockInfosExternal, ...mockFullOwnershipLockInfosChange];

/**
 * 100 external addresses index 0..99
 */
export const mockRuleBasedOwnershipLockInfos: LockInfo[] = new Array(100).fill(0).map((_, i) => {
  const lock = {
    args: '0x',
    codeHash: '0x',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/4410179'/0'`,
    index: i,
    lock,
    blake160: '',
    publicKey: '0x000000000000000000000000000000000000000000000000000000000000000000',
    lockHash: '0x',
    network: 'ckb_testnet' as const,
    onchain: false,
  };
});

export function generateBlankFullLocksAndPointers(): FullLocksAndPointer {
  const fullOwnership: FullLocksAndPointer = {
    lockInfos: {
      external: [],
      change: [],
    },
    pointers: {
      external: null,
      change: null,
    },
  };
  return fullOwnership;
}

export function generateFullLocksAndPointers(): FullLocksAndPointer {
  const fullOwnership: FullLocksAndPointer = {
    lockInfos: {
      external: mockFullOwnershipLockInfosExternal.map((lock, i) => {
        const offChain = i % 5 === 0 && i < 100;
        lock.onchain = !offChain;
        return lock;
      }),
      change: mockFullOwnershipLockInfosChange.map((lock, i) => {
        const offChain = i % 5 === 0 && i < 100;
        lock.onchain = !offChain;
        return lock;
      }),
    },
    pointers: {
      external: null,
      change: null,
    },
  };
  return fullOwnership;
}

export function generateRuleBasedLocksAndPointers(): RuleBasedLocksAndPointer {
  const rbOwnership: RuleBasedLocksAndPointer = {
    lockInfos: mockRuleBasedOwnershipLockInfos.map((lock, i) => {
      const offChain = i % 5 === 0 && i < 100;
      lock.onchain = !offChain;
      return lock;
    }),
    pointer: null,
  };
  return rbOwnership;
}
export function generateBlankRuleBasedLocksAndPointers(): RuleBasedLocksAndPointer {
  const rbOwnership: RuleBasedLocksAndPointer = {
    lockInfos: [],
    pointer: null,
  };
  return rbOwnership;
}
