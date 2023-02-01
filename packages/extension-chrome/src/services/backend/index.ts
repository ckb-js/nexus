import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  hasHistory: (script: Script) => Promise<boolean>;
}

export class BackendProvider {
  public static getDefaultBackend(): Backend {
    const nodeUri = 'https://testnet.ckb.dev';
    const indexer = new Indexer(nodeUri);
    return {
      nodeUri,
      indexer,
      hasHistory: async (script: Script) => {
        const txCollector = new TransactionCollector(
          indexer,
          {
            lock: script,
          },
          nodeUri,
        );
        let hasRecord = false;
        for await (const _ of txCollector.collect()) {
          hasRecord = true;
          break;
        }
        return hasRecord;
      },
    };
  }
}
