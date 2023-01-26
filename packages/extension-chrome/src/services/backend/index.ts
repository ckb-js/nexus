import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  countTx: (script: Script) => Promise<number>;
}

export class BackendProvider {
  public static getDefaultBackend(): Backend {
    const nodeUri = 'http://127.0.0.1:8118/rpc';
    const indexer = new Indexer(nodeUri);
    return {
      nodeUri,
      indexer,
      countTx: async (script: Script) => {
        const txCollector = new TransactionCollector(
          indexer,
          {
            lock: script,
          },
          nodeUri,
        );
        const count = await txCollector.count();
        return count;
      },
    };
  }
}
