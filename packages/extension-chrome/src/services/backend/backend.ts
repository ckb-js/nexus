import { OutPoint } from '@ckb-lumos/base';
import { Cell } from '@ckb-lumos/base';
import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector, CellCollector } from '@ckb-lumos/ckb-indexer';
import { RPC } from '@ckb-lumos/rpc';
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  rpc: RPC;

  hasHistory: (payload: { lock: Script }) => Promise<boolean>;
  getLiveCells: (payload: { locks: Script[] }) => Promise<Cell[]>;
  getLiveCellFetcher: () => (outPoint: OutPoint) => Promise<Cell>;
}

export class DefaultBackend implements Backend {
  nodeUri: string;
  indexer: Indexer;
  rpc: RPC;

  constructor(payload: { nodeUri: string }) {
    this.nodeUri = payload.nodeUri;
    this.indexer = new Indexer(payload.nodeUri);
    this.rpc = new RPC(payload.nodeUri);
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

  async getLiveCells(payload: { locks: Script[] }): Promise<Cell[]> {
    let result: Cell[] = [];
    for (let index = 0; index < payload.locks.length; index++) {
      const cellCollector = new CellCollector(this.indexer, {
        lock: payload.locks[index],
      });
      for await (const cell of cellCollector.collect()) {
        result.push(cell);
      }
    }
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
