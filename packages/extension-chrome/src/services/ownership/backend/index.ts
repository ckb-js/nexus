import { Cell, Script, Transaction } from '@ckb-lumos/lumos';
import type { ConfigService, Paginate, Promisable } from '@nexus-wallet/types';
import { asserts } from '@nexus-wallet/utils';
import { OutputValidator } from '@nexus-wallet/protocol/lib/base';
import { NetworkId } from '../storage';
import { createTransactionSkeleton, LiveCellFetcher, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import chunk from 'lodash.chunk';
import isEqual from 'lodash.isequal';
import { RPC as RpcType } from '@ckb-lumos/rpc/lib/types/rpc';
import { NexusCommonErrors } from '../../../errors';
import { createRpcClient, loadSecp256k1ScriptDep, toCell, toQueryParam } from './backendUtils';
import { ChainInfo, Hash } from '@ckb-lumos/base';
import { ParamsFormatter, ResultFormatter } from '@ckb-lumos/rpc';
type GetLiveCellsResult = Paginate<Cell> & { lastLock?: Script };

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

  getBlockchainInfo(): Promise<ChainInfo>;

  sendTransaction(tx: Transaction, outputsValidator?: OutputValidator): Promise<string>;
}

// TODO better make it persisted in localstorage/db
const secp256k1Blake160ScriptInfoCache = new Map<NetworkId, ScriptConfig>();

export function createBackend(_payload: { nodeUrl: string }): Backend {
  // TODO replace with batch client when batch client supported type
  const client = createRpcClient(_payload.nodeUrl);

  return {
    getSecp256k1Blake160ScriptConfig: async ({ networkId }): Promise<ScriptConfig> => {
      let config = secp256k1Blake160ScriptInfoCache.get(networkId);
      if (!config) {
        const onChainConfig = await loadSecp256k1ScriptDep({ nodeUrl: _payload.nodeUrl });
        config = onChainConfig;
        secp256k1Blake160ScriptInfoCache.set(networkId, onChainConfig);
      }
      return config;
    },
    hasHistories: async (payload: { locks: Script[] }): Promise<boolean[]> => {
      const responses = await client.batchRequest<RpcType.GetTransactionsResult>(
        'get_transactions',
        payload.locks.map((lock) => [
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
        ]),
      );
      const result = responses.map((res) => res.objects.length > 0);
      return result;
    },
    getLiveCellsByLocks: async ({
      locks,
      cursor,
      limit = 20,
    }: {
      locks: Script[];
      cursor?: string;
      limit?: number;
    }): Promise<GetLiveCellsResult> => {
      const emptyReturnValue: GetLiveCellsResult = {
        objects: [],
        cursor: '',
        lastLock: undefined,
      };

      if (locks.length === 0) {
        return emptyReturnValue;
      }

      const requestParams = locks.map((lock, i) => {
        if (i === 0) {
          // only first lock could use the cursor
          return toQueryParam({ lock, cursor });
        }
        return toQueryParam({ lock });
      });
      // TODO make chunk size configurable, default to 10
      const chunkedRequestParams = chunk(requestParams, 10);
      const chunkedLocks = chunk(locks, 10);

      const responsePromises = chunkedRequestParams.map((chunkedRequestParam) =>
        client.batchRequest<RpcType.GetLiveCellsResult>('get_cells', chunkedRequestParam),
      );
      const responses = await Promise.all(responsePromises);

      let result = toGetLiveCellsResult(responses, chunkedLocks, limit);

      // refetch cursor only when the result object length exceeds the limit
      if (result.objects.length > limit) {
        const searchOffset = result.objects.length - limit;
        const lastCursor = result.cursor;
        const lastLock = result.lastLock;
        asserts.asserts(lastLock, 'lastLock not found');
        asserts.asserts(lastCursor, 'lastCursor not found');
        const descSearchParam = toQueryParam({
          lock: lastLock,
          cursor: lastCursor,
          limit: `0x${searchOffset.toString(16)}`,
          order: 'desc',
        });
        const descSearchResp = await client.request<RpcType.GetLiveCellsResult>('get_cells', descSearchParam);
        const descSearchRespCells = descSearchResp.objects.map(toCell);

        asserts.asserts(
          isEqual(descSearchRespCells[descSearchRespCells.length - 1], result.objects[limit - 1]),
          'desc search result not match',
        );
        result = {
          objects: result.objects.slice(0, limit),
          cursor: descSearchResp.last_cursor,
          lastLock,
        };
      }

      return result;
    },
    resolveTx: (tx) => {
      const fetcher: LiveCellFetcher = async (outPoint) => {
        const content = await client.request<{
          cell: RpcType.LiveCell;
          status: string;
        }>('get_live_cell', [
          {
            index: outPoint.index,
            tx_hash: outPoint.txHash,
          },
          true,
        ]);
        const rpcCell = content.cell;
        /* istanbul ignore if */
        if (!rpcCell) {
          throw NexusCommonErrors.CellNotFound(outPoint);
        }
        return {
          outPoint,
          cellOutput: {
            capacity: rpcCell.output.capacity,
            lock: ResultFormatter.toScript(rpcCell.output.lock),
            type: rpcCell.output.type ? ResultFormatter.toScript(rpcCell.output.type) : undefined,
          },
          data: rpcCell.data.content,
        };
      };
      return createTransactionSkeleton(tx, fetcher);
    },

    getBlockchainInfo: async () => {
      const res = await client.request<RpcType.BlockchainInfo>('get_blockchain_info', null);
      return ResultFormatter.toBlockchainInfo(res);
    },
    sendTransaction(tx: Transaction, outputsValidator = 'well_known_scripts_only') {
      return client.request<Hash, [RpcType.RawTransaction, OutputValidator]>('send_transaction', [
        ParamsFormatter.toRawTransaction(tx),
        outputsValidator,
      ]);
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

/**
 * transform the rpc response to the GetLiveCellsResult
 * @param responses the rpc response
 * @param chunkedLocks the locks that used to make the rpc request
 * @param limit the limit of the result objects
 * @returns
 */
function toGetLiveCellsResult(
  responses: RpcType.GetLiveCellsResult[][],
  chunkedLocks: Script[][],
  limit: number,
): GetLiveCellsResult {
  const result: GetLiveCellsResult = {
    objects: [],
    cursor: '',
    lastLock: undefined,
  };

  let fullFilledLimit = false;
  for (let i = 0; i < responses.length; i++) {
    for (let j = 0; j < responses[i].length; j++) {
      const element = responses[i][j];
      if (!element.objects.length) {
        continue;
      }
      result.objects.push(...element.objects.map(toCell));
      if (element.last_cursor) {
        result.cursor = element.last_cursor;
        result.lastLock = chunkedLocks[i][j];
      }
      if (result.objects.length >= limit) {
        fullFilledLimit = true;
        break;
      }
    }
    if (fullFilledLimit) break;
  }
  return result;
}
