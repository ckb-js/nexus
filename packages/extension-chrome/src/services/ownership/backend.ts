import { OutPoint } from '@ckb-lumos/base';
import { Cell } from '@ckb-lumos/base';
import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
import { RPC } from '@ckb-lumos/rpc';
import { RPC as IndexerRPC } from '@ckb-lumos/ckb-indexer/lib/rpc';
import { GetLiveCellsResult } from '@ckb-lumos/ckb-indexer/lib/type';

export type CellsWithCursor = {
  cells: Cell[];
  cursor: string;
};
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  rpc: RPC;
  indexerRPC: IndexerRPC;

  hasHistory: (payload: { lock: Script }) => Promise<boolean>;
  getNextLiveCellWithCursor: (payload: {
    lock: Script;
    filter: {
      limit: number;
      indexerCursor?: string;
    };
  }) => Promise<CellsWithCursor>;
  getLiveCellFetcher: () => (outPoint: OutPoint) => Promise<Cell>;
}

export class DefaultBackend implements Backend {
  nodeUri: string;
  indexer: Indexer;
  rpc: RPC;
  indexerRPC: IndexerRPC;

  constructor(payload: { nodeUri: string }) {
    this.nodeUri = payload.nodeUri;
    this.indexer = new Indexer(payload.nodeUri);
    this.rpc = new RPC(payload.nodeUri);
    this.indexerRPC = new IndexerRPC(payload.nodeUri);
  }

  getLiveCellFetcher() {
    return async (outPoint: OutPoint): Promise<Cell> => {
      const txOutput = await this.rpc.getLiveCell(outPoint, false);
      return {
        cellOutput: txOutput.cell.output,
        data: txOutput.cell.data.content,
      };
    };
  }

  async getNextLiveCellWithCursor(payload: {
    lock: Script;
    filter: {
      limit: number;
      indexerCursor?: string;
    };
  }): Promise<CellsWithCursor> {
    console.log('getNextLiveCellWithCursor payload', payload);

    const limit = `0x${payload.filter.limit.toString(16)}`;
    let rpcResult: GetLiveCellsResult<true>;
    if (payload.filter.indexerCursor) {
      rpcResult = await this.indexerRPC.getCells(
        { script: payload.lock, scriptType: 'lock' },
        'asc',
        limit,
        payload.filter.indexerCursor,
      );
    } else {
      rpcResult = await this.indexerRPC.getCells({ script: payload.lock, scriptType: 'lock' }, 'asc', limit);
    }
    if (rpcResult.objects.length === 0) {
      return {
        cells: [],
        cursor: '',
      };
    }
    const result: Cell[] = rpcResult.objects.map((indexerCell) => {
      const cells: Cell = {
        cellOutput: indexerCell.output,
        data: indexerCell.outputData,
        outPoint: indexerCell.outPoint,
        blockNumber: indexerCell.blockNumber,
      };
      return cells;
    });
    return {
      cells: result,
      cursor: rpcResult.lastCursor,
    };
  }

  async hasHistory(payload: { lock: Script }): Promise<boolean> {
    const txCollector = new TransactionCollector(
      this.indexer,
      {
        lock: payload.lock,
      },
      this.nodeUri,
    );
    let hasRecord = false;
    for await (const _ of txCollector.collect()) {
      hasRecord = true;
      break;
    }
    return hasRecord;
  }
}

export class BackendProvider {
  public static getDefaultBackend(payload?: { mainnet?: boolean }): Backend {
    const nodeUri = payload?.mainnet ? 'https://mainnet.ckb.dev/rpc' : 'https://testnet.ckb.dev';
    return new DefaultBackend({ nodeUri });
  }
}
