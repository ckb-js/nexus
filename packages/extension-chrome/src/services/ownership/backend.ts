import type { Cell, HashType, HexString, Script, Transaction } from '@ckb-lumos/lumos';
import { RPC } from '@ckb-lumos/lumos';
import type { ConfigService, Paginate, Promisable } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import { NetworkId } from './storage';
import { createTransactionSkeleton, LiveCellFetcher, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { throwError } from '@nexus-wallet/utils/lib/error';
import { ScriptConfig } from '@ckb-lumos/config-manager';

export interface Backend {
  getSecp256k1Blake160ScriptConfig(): Promise<ScriptConfig>;

  hasHistories(payload: { locks: Script[] }): Promise<boolean[]>;

  getLiveCellsByLocks(payload: {
    locks: Script[];
    /**
     * the cursor is the ckb indexer cursor
     */
    cursor?: string;
    limit?: number;
  }): Promise<Paginate<Cell>>;

  resolveTx(tx: Transaction): Promise<TransactionSkeletonType>;
}

type ScriptTemplate = { codeHash: HexString; hashType: HashType };

const _Secp256k1Blake160ScriptInfoCache = new Map<NetworkId, ScriptTemplate>();

// TODO implement the backend
/* istanbul ignore next */
export function createBackend(_payload: { rpc: string }): Backend {
  const rpc = new RPC(_payload.rpc);

  return {
    getSecp256k1Blake160ScriptConfig: () => {
      errors.unimplemented();
    },
    hasHistories: () => {
      errors.unimplemented();
    },
    getLiveCellsByLocks: () => {
      errors.unimplemented();
    },
    resolveTx: (tx) => {
      const fetcher: LiveCellFetcher = async (outPoint) => {
        const res = await rpc.getLiveCell(outPoint, false);
        if (!res) throwError(`Cannot find cell of %s`, outPoint);
        const { cell } = res;
        return { cellOutput: cell.output, data: cell.data.content, outPoint };
      };

      return createTransactionSkeleton(tx, fetcher);
    },
  };
}

// TODO refactor it, move it to a common place
type InstanceProvider<T> = { resolve: () => Promisable<T> };
export type BackendProvider = InstanceProvider<Backend>;

export function createBackendProvider({ configService }: { configService: ConfigService }): BackendProvider {
  return {
    resolve: async () => {
      const network = await configService.getSelectedNetwork();
      return createBackend({ rpc: network.rpcUrl });
    },
  };
}
