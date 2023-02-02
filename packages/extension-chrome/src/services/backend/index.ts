import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  hasHistory: (payload: { lock: Script }) => Promise<boolean>;
}

export class BackendProvider {
  public static getDefaultBackend(): Backend {
    const nodeUri = 'https://testnet.ckb.dev';
    const indexer = new Indexer(nodeUri);
    return {
      nodeUri,
      indexer,
      hasHistory: async (payload: { lock: Script }) => {
        const txCollector = new TransactionCollector(
          indexer,
          {
            lock: payload.lock,
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
