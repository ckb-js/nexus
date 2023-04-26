import { bytes } from '@ckb-lumos/codec';
import { Backend } from '../../src/services/ownership/backend';
import { errors } from '@nexus-wallet/utils';
import type { Script } from '@ckb-lumos/lumos';
import { Promisable } from '@nexus-wallet/types';
import { ChainInfo, Transaction } from '@ckb-lumos/base';

export const mockBackend = createMockBackend();

type Options = {
  hasHistory?: (lock: Script) => Promisable<boolean>;
  getBlockchainInfo?: () => Promise<ChainInfo>;
  sendTransaction?: (tx: Transaction) => Promise<string>;
};

export function createMockBackend(options = {} as Options): Backend {
  return {
    getSecp256k1Blake160ScriptConfig: async () => ({
      HASH_TYPE: 'type',
      INDEX: '0x0',
      TX_HASH: bytes.hexify(Buffer.alloc(32)),
      DEP_TYPE: 'code',
      CODE_HASH: bytes.hexify(Buffer.alloc(32)),
    }),
    hasHistories: async ({ locks }) => Promise.all(locks.map((lock) => options?.hasHistory?.(lock) ?? false)),
    resolveTx: errors.unimplemented,
    getLiveCellsByLocks: errors.unimplemented,
    getBlockchainInfo: options.getBlockchainInfo || errors.unimplemented,
    sendTransaction: options.sendTransaction || errors.unimplemented,
  };
}
