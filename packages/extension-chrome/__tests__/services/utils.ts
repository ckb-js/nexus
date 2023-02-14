import { RPC } from '@ckb-lumos/rpc';
import { RPC as IndexerRPC } from '@ckb-lumos/ckb-indexer/lib/rpc';
import { Cell, utils } from '@ckb-lumos/base';
import { CkbIndexer } from '@ckb-lumos/ckb-indexer/lib/indexer';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { Promisable } from '@nexus-wallet/types/lib';
import { KeystoreService, SignMessagePayload } from '@nexus-wallet/types/lib/services/KeystoreService';
import { LockInfo, LocksAndPointer } from '../../src/services/backend/types';
import { Backend } from './../../src/services/backend/backend';

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
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/44'/309'/0'/0`,
    index: i,
    lock,
    blake160: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    publicKey: `0x${String(i).padStart(2, '0').repeat(33)}`,
    lockHash: utils.computeScriptHash(lock),
    network: 'ckb_testnet' as const,
    onchain: false,
  };
});
export const mockFullOwnershipLockInfosChange: LockInfo[] = new Array(100).fill(0).flatMap((_, i) => {
  const lock = {
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/44'/309'/0'/1`,
    index: i,
    lock,
    blake160: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    publicKey: `0x${String(i).padStart(2, '0').repeat(33)}`,
    lockHash: utils.computeScriptHash(lock),
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
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type' as const,
  };
  return {
    parentPath: `m/4410179'/0'`,
    index: i,
    lock,
    blake160: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    publicKey: `0x${String(i).padStart(2, '0').repeat(33)}`,
    lockHash: utils.computeScriptHash(lock),
    network: 'ckb_testnet' as const,
    onchain: false,
  };
});

export const generateLocksAndPointers = (payload: { fullOwnership: boolean }): LocksAndPointer => {
  const lockInfos = payload.fullOwnership ? mockFullOwnershipLockInfos : mockRuleBasedOwnershipLockInfos;
  const fullOwnership: LocksAndPointer = {
    details: {
      offChain: {
        external: lockInfos.filter((_, i) => i % 5 === 0 && i < 100),
        change: lockInfos.filter((_, i) => i % 5 === 0 && i >= 100),
      },
      onChain: {
        external: lockInfos
          .filter((_, i) => i % 5 !== 0 && i < 100)
          .map((lockInfo) => ({ ...lockInfo, onchain: true })),
        change: lockInfos.filter((_, i) => i % 5 !== 0 && i >= 100).map((lockInfo) => ({ ...lockInfo, onchain: true })),
      },
    },
    pointers: {
      offChain: {
        external: null,
        change: null,
      },
    },
  };
  const rbOwnership: LocksAndPointer = {
    details: {
      offChain: {
        external: lockInfos.filter((_, i) => i % 5 === 0 && i < 100),
        change: [],
      },
      onChain: {
        external: lockInfos
          .filter((_, i) => i % 5 !== 0 && i < 100)
          .map((lockInfo) => ({ ...lockInfo, onchain: true })),
        change: [],
      },
    },
    pointers: {
      offChain: {
        external: null,
        change: null,
      },
    },
  };
  return payload.fullOwnership ? fullOwnership : rbOwnership;
};
