import { OutPoint } from '@ckb-lumos/base';
import { Cell } from '@ckb-lumos/base';
import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
import { RPC } from '@ckb-lumos/rpc';
import { RPC as IndexerRPC } from '@ckb-lumos/ckb-indexer/lib/rpc';

export type CellWithCursor = {
  cell: Cell;
  cursor: string;
};
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  rpc: RPC;
  indexerRPC: IndexerRPC;

  hasHistory: (payload: { lock: Script }) => Promise<boolean>;
  // getLiveCells: (payload: { locks: Script[] }) => Promise<CellWithCursor[]>;
  getNextLiveCellWithCursor: (payload: { lock: Script; indexerCursor?: string }) => Promise<CellWithCursor | undefined>;
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
    indexerCursor?: string;
  }): Promise<CellWithCursor | undefined> {
    let rpcResult;
    if (payload.indexerCursor) {
      rpcResult = await this.indexerRPC.getCells(
        { script: payload.lock, scriptType: 'lock' },
        'asc',
        '0x1',
        payload.indexerCursor,
      );
    } else {
      rpcResult = await this.indexerRPC.getCells({ script: payload.lock, scriptType: 'lock' }, 'asc', '0x1');
    }
    if (rpcResult.objects.length === 0) {
      return undefined;
    }
    const indexerCell = rpcResult.objects[0];
    const cell: Cell = {
      cellOutput: indexerCell.output,
      data: indexerCell.outputData,
      outPoint: indexerCell.outPoint,
      blockNumber: indexerCell.blockNumber,
    };

    const result: CellWithCursor = {
      cell,
      cursor: rpcResult.lastCursor,
    };

    return result;
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
