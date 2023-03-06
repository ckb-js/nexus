import { Cell, Script, Transaction, utils } from '@ckb-lumos/lumos';
import type { ConfigService, Paginate, Promisable } from '@nexus-wallet/types';
import { asserts } from '@nexus-wallet/utils';
import { NetworkId } from './storage';
import { createTransactionSkeleton, LiveCellFetcher, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { throwError } from '@nexus-wallet/utils/lib/error';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import chunk from 'lodash/chunk';
import isEqual from 'lodash/isEqual';

export interface Backend {
  getSecp256k1Blake160ScriptConfig(payload: { networkId: string }): Promise<ScriptConfig>;

  hasHistories(payload: { locks: Script[] }): Promise<boolean[]>;

  getLiveCellsByLocks(payload: {
    locks: Script[];
    /**
     * the cursor is the ckb indexer cursor
     */
    cursor?: string;
    limit?: number;
  }): Promise<Paginate<Cell> & { lastLock?: Script }>;

  resolveTx(tx: Transaction): Promise<TransactionSkeletonType>;
}

// TODO better make it persisted in localstorage/db
const _Secp256k1Blake160ScriptInfoCache = new Map<NetworkId, ScriptConfig>();

export function createBackend(_payload: { nodeUrl: string }): Backend {
  // TODO use rpc to fetch onchain data when lumos rpc is ready to use in chrome extension
  // const rpc = new RPC(_payload.nodeUrl);

  return {
    getSecp256k1Blake160ScriptConfig: async ({ networkId }): Promise<ScriptConfig> => {
      let config = _Secp256k1Blake160ScriptInfoCache.get(networkId);
      if (!config) {
        const onChainConfig = await loadSecp256k1ScriptDep({ nodeUrl: _payload.nodeUrl });
        config = onChainConfig;
        _Secp256k1Blake160ScriptInfoCache.set(networkId, onChainConfig);
      }
      return config;
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
            search_type: 'exact',
          },
          'asc',
          '0x1',
        ],
      });
      const requestParam = payload.locks.map(toRequestParam);
      const rawResponse = await fetch(_payload.nodeUrl, {
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
    getLiveCellsByLocks: async ({
      locks,
      cursor,
      limit = 20,
    }: {
      locks: Script[];
      /**
       * the cursor is the ckb indexer cursor
       */
      cursor?: string;
      // TODO implement limit
      limit?: number;
    }): Promise<Paginate<Cell> & { lastLock?: Script }> => {
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
            search_type: 'exact',
          },
          'asc',
          '0x64',
          cursor && cursor !== '0x' ? cursor : null,
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
        const rawResponse = await fetch(_payload.nodeUrl, {
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

      if (locks.length === 0) {
        return {
          objects: [],
          cursor: '',
        };
      }

      const requets = locks.map((lock, i) => {
        if (i === 0) {
          // only first lock could use the cursor
          return { lock, cursor };
        }
        return { lock };
      });
      // TODO make chunk size configurable, default to 10
      const chunkedRequests = chunk(requets, 10);

      const responsePromises = chunkedRequests.map((chunkedRequest) => batchGetCells(chunkedRequest));
      const responses = await Promise.all(responsePromises);

      let result: Paginate<Cell> & { lastLock?: Script } = {
        objects: [],
        cursor: '',
      };
      let fullFilledLimit = false;
      for (let i = 0; i < responses.length; i++) {
        for (let j = 0; j < responses[i].length; j++) {
          const element: Paginate<Cell> = responses[i][j];
          if (!element.objects.length) continue;
          result.objects.push(...element.objects);
          if (element.cursor) {
            result.cursor = element.cursor;
            result.lastLock = chunkedRequests[i][j].lock;
          }
          if (result.objects.length >= limit) {
            fullFilledLimit = true;
            break;
          }
        }
        if (fullFilledLimit) break;
      }

      // refetch cursor only when the result object length exceeds the limit
      if (result.objects.length > limit) {
        const searchOffset = result.objects.length - limit;
        const lastCursor = result.cursor;
        const lastLock = result.lastLock;
        asserts.asserts(lastLock, 'lastLock not found');
        asserts.asserts(lastCursor, 'lastCursor not found');
        const descSearchParam = {
          id: 1,
          jsonrpc: '2.0',
          method: 'get_cells',
          params: [
            {
              script: {
                code_hash: lastLock.codeHash,
                hash_type: lastLock.hashType,
                args: lastLock.args,
              },
              script_type: 'lock',
              search_type: 'exact',
            },
            'desc',
            `0x${searchOffset.toString(16)}`,
            lastCursor,
          ],
        };
        const descSearchResp = await fetch(_payload.nodeUrl, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(descSearchParam),
          method: 'POST',
        });
        const descSearchResult = toPaginatedCells(await descSearchResp.json());

        asserts.asserts(
          isEqual(descSearchResult.objects.pop(), result.objects[limit - 1]),
          'desc search result not match',
        );
        result = {
          objects: result.objects.slice(0, limit),
          cursor: descSearchResult.cursor,
          lastLock,
        };
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
        const rawResult = await fetch(_payload.nodeUrl, {
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
      return createBackend({ nodeUrl: network.rpcUrl });
    },
  };
}

/* istanbul ignore next */
export async function loadSecp256k1ScriptDep(payload: { nodeUrl: string }): Promise<ScriptConfig> {
  const rawResult = await fetch(payload.nodeUrl, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 2,
      jsonrpc: '2.0',
      method: 'get_block_by_number',
      params: ['0x0'],
    }),
    method: 'POST',
  });
  const genesisBlock = (await rawResult.json()).result;
  if (!genesisBlock) throw new Error("can't load genesis block");
  const secp256k1DepTxHash = genesisBlock.transactions[1].hash;
  asserts.asserts(secp256k1DepTxHash, "can't load secp256k1 transaction");
  const rawTypeScript = genesisBlock.transactions[0].outputs[1].type;
  asserts.asserts(rawTypeScript, "can't load secp256k1 type script");
  const typeScript: Script = {
    codeHash: rawTypeScript.code_hash,
    hashType: rawTypeScript.hash_type,
    args: rawTypeScript.args,
  };
  const secp256k1TypeHash = utils.computeScriptHash(typeScript);

  return {
    HASH_TYPE: 'type',
    CODE_HASH: secp256k1TypeHash,
    INDEX: '0x0',
    TX_HASH: secp256k1DepTxHash,
    DEP_TYPE: 'depGroup',
  };
}
