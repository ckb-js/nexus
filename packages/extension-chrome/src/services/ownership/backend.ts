import { Paginate } from '@nexus-wallet/types';
import { OutPoint } from '@ckb-lumos/base';
import { Cell } from '@ckb-lumos/base';
import { Script } from '@ckb-lumos/base';
import { Indexer } from '@ckb-lumos/ckb-indexer';
import { RPC } from '@ckb-lumos/rpc';
import { RPC as IndexerRPC } from '@ckb-lumos/ckb-indexer/lib/rpc';

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
  }) => Promise<Paginate<Cell>>;
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
      const requestParam = {
        id: 42,
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

      const rawResult = await fetch(this.nodeUri, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParam),
        method: 'POST',
      });
      const content = await rawResult.json();
      console.log('getLiveCell content', content, outPoint);

      return {
        cellOutput: {
          capacity: content.result.cell.output.capacity,
          lock: {
            codeHash: content.result.cell.output.lock.code_hash,
            hashType: content.result.cell.output.lock.hash_type,
            args: content.result.cell.output.lock.args,
          },
        },
        data: content.result.cell.data.content,
      };
    };
  }

  async getNextLiveCellWithCursor(payload: {
    lock: Script;
    filter: {
      limit: number;
      indexerCursor?: string;
    };
  }): Promise<Paginate<Cell>> {
    const limit = `0x${payload.filter.limit.toString(16)}`;
    const requestParam = {
      id: 0,
      jsonrpc: '2.0',
      method: 'get_cells',
      params: [
        {
          script: {
            code_hash: payload.lock.codeHash,
            hash_type: payload.lock.hashType,
            args: payload.lock.args,
          },
          script_type: 'lock',
          filter: {},
        },
        'asc',
        limit,
        null,
      ],
    };
    if (payload.filter.indexerCursor) {
      requestParam.params[3] = payload.filter.indexerCursor;
    }
    const rawResult = await fetch(this.nodeUri, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParam),
      method: 'POST',
    });
    const content = await rawResult.json();
    console.log('getNextLiveCellWithCursor content', content, payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Cell[] = content.result.objects.map((object: any) => {
      const cells: Cell = {
        cellOutput: {
          capacity: object.output.capacity,
          lock: {
            codeHash: object.output.lock.code_hash,
            hashType: object.output.lock.hash_type,
            args: object.output.lock.args,
          },
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
      cursor: content.result.last_cursor,
    };
  }

  async hasHistory(payload: { lock: Script }): Promise<boolean> {
    const requestParam = {
      id: 2,
      jsonrpc: '2.0',
      method: 'get_transactions',
      params: [
        {
          script: {
            code_hash: payload.lock.codeHash,
            hash_type: payload.lock.hashType,
            args: payload.lock.args,
          },
          script_type: 'lock',
        },
        'asc',
        '0x1',
      ],
    };
    const result = await fetch(this.nodeUri, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParam),
      method: 'POST',
    });
    const content = await result.json();
    return content.result.objects.length > 0;
  }
}

export class BackendProvider {
  public static getDefaultBackend(payload?: { mainnet?: boolean }): Backend {
    const nodeUri = payload?.mainnet ? 'https://mainnet.ckb.dev/rpc' : 'https://testnet.ckb.dev';
    return new DefaultBackend({ nodeUri });
  }
}
