import { Cell, HashType, HexString, RPC, Script, Transaction, utils } from '@ckb-lumos/lumos';
import type { ConfigService, Paginate, Promisable } from '@nexus-wallet/types';
import { asserts } from '@nexus-wallet/utils';
import { NetworkId } from './storage';
import { createTransactionSkeleton, LiveCellFetcher, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { throwError } from '@nexus-wallet/utils/lib/error';
import { ScriptConfig, getConfig } from '@ckb-lumos/config-manager';

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
  // TODO use rpc to fetch onchain data when lumos rpc is ready to use in chrome extension
  const rpc = new RPC(_payload.rpc);

  return {
    getSecp256k1Blake160ScriptConfig: async (): Promise<ScriptConfig> => {
      const lumosConfig = getConfig();
      let secp256k1Config = lumosConfig.SCRIPTS['SECP256K1_BLAKE160'];
      if (!secp256k1Config) {
        secp256k1Config = await loadSecp256k1ScriptDep(rpc);
      }
      return Promise.resolve(secp256k1Config);
    },
    hasHistories: async (payload: { locks: Script[] }): Promise<boolean[]> => {
      const toRequestParam = (lock: Script, id: number) => ({
        id,
        jsonrpc: '2.0',
        method: 'get_transactions',
        params: [
          {
            script: {
              code_hash: lock.codeHash,
              hash_type: lock.hashType,
              args: lock.args,
            },
            script_type: 'lock',
          },
          'asc',
          '0x1',
        ],
      });
      const requestParam = payload.locks.map(toRequestParam);
      const rawResponse = await fetch(_payload.rpc, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParam),
        method: 'POST',
      });
      const responses = await rawResponse.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = responses.map((response: any) => response.result.objects.length > 0);
      return result;
    },
    getLiveCellsByLocks: async (payload: {
      locks: Script[];
      /**
       * the cursor is the ckb indexer cursor
       */
      cursor?: string;
      // TODO implement limit
      limit?: number;
    }): Promise<Paginate<Cell>> => {
      const toRequestParam = (lock: Script, id: number, cursor?: string) => ({
        id,
        jsonrpc: '2.0',
        method: 'get_cells',
        params: [
          {
            script: {
              code_hash: lock.codeHash,
              hash_type: lock.hashType,
              args: lock.args,
            },
            script_type: 'lock',
          },
          'asc',
          '0x64',
          cursor || null,
        ],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toPaginatedCells = (response: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Cell[] = response.result.objects.map((object: any) => {
          const cells: Cell = {
            cellOutput: {
              capacity: object.output.capacity,
              lock: {
                codeHash: object.output.lock.code_hash,
                hashType: object.output.lock.hash_type,
                args: object.output.lock.args,
              },
              type: object.output.type
                ? {
                    codeHash: object.output.type.code_hash,
                    hashType: object.output.type.hash_type,
                    args: object.output.type.args,
                  }
                : undefined,
            },
            data: object.output_data,
            outPoint: {
              txHash: object.out_point.tx_hash,
              index: object.out_point.index,
            },
            blockNumber: object.block_number,
          };
          return cells;
        });
        return {
          objects: result,
          cursor: response.result.last_cursor,
        };
      };
      const batchGetCells = async (params: { lock: Script; cursor?: string }[]) => {
        const requestParam = params.map(({ lock, cursor }, id) => {
          return toRequestParam(lock, id, cursor);
        });
        const rawResponse = await fetch(_payload.rpc, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestParam),
          method: 'POST',
        });
        const responses = await rawResponse.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return responses.map((response: any) => toPaginatedCells(response));
      };

      const chunkedRequests = [];
      // TODO make chunk size configurable, default to 20
      for (let lockIndex = 0; lockIndex < payload.locks.length; lockIndex += 20) {
        const chunkLocks = payload.locks?.slice(lockIndex, lockIndex + 20);
        if (lockIndex === 0) {
          const currentChunkRequest = chunkLocks.map((lock, i) => {
            if (i === 0) {
              return { lock, cursor: payload.cursor };
            }
            return { lock };
          });
          chunkedRequests.push(currentChunkRequest);
        } else {
          const currentChunkRequest = chunkLocks.map((lock) => ({ lock }));
          chunkedRequests.push(currentChunkRequest);
        }
      }
      const responsePromises = chunkedRequests.map((chunkedRequest) => batchGetCells(chunkedRequest));
      const responses = await Promise.all(responsePromises);

      const result: Paginate<Cell> = {
        objects: [],
        cursor: '',
      };
      for (let i = 0; i < responses.length; i++) {
        for (let j = 0; j < responses[i].length; j++) {
          const element: Paginate<Cell> = responses[i][j];
          result.objects.push(...element.objects);
          result.cursor = element.cursor;
        }
        if (payload.limit && result.objects.length >= payload.limit) {
          break;
        }
      }

      return result;
    },
    resolveTx: (tx) => {
      const fetcher: LiveCellFetcher = async (outPoint) => {
        const requestParam = {
          id: 1,
          jsonrpc: '2.0',
          method: 'get_live_cell',
          params: [
            {
              index: outPoint.index,
              tx_hash: outPoint.txHash,
            },
            true,
          ],
        };
        const rawResult = await fetch(_payload.rpc, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestParam),
          method: 'POST',
        });
        const content = await rawResult.json();
        if (!content) throwError(`Cannot find cell of %s`, outPoint);
        const object = content.result.cell;
        const cell: Cell = {
          outPoint,
          cellOutput: {
            capacity: object.output.capacity,
            lock: {
              codeHash: object.output.lock.code_hash,
              hashType: object.output.lock.hash_type,
              args: object.output.lock.args,
            },
            type: object.output.type
              ? {
                  codeHash: object.output.type.code_hash,
                  hashType: object.output.type.hash_type,
                  args: object.output.type.args,
                }
              : undefined,
          },
          data: object.data.content,
        };
        return cell;
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

export async function loadSecp256k1ScriptDep(rpc: RPC): Promise<ScriptConfig> {
  const genesisBlock = await rpc.getBlockByNumber('0x0');
  if (!genesisBlock) throw new Error("can't load genesis block");
  const secp256k1DepTxHash = genesisBlock.transactions[1].hash;
  asserts.asserts(secp256k1DepTxHash, "can't load secp256k1 transaction");
  const typeScript = genesisBlock.transactions[0].outputs[1].type;
  asserts.asserts(typeScript, "can't load secp256k1 type script");
  const secp256k1TypeHash = utils.computeScriptHash(typeScript);

  return {
    HASH_TYPE: 'type',
    CODE_HASH: secp256k1TypeHash,
    INDEX: '0x0',
    TX_HASH: secp256k1DepTxHash,
    DEP_TYPE: 'depGroup',
  };
}
