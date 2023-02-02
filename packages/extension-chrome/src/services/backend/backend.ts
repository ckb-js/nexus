import { Script } from '@ckb-lumos/base';
import { Indexer, TransactionCollector } from '@ckb-lumos/ckb-indexer';
export interface Backend {
  nodeUri: string;
  indexer: Indexer;
  hasHistory: (payload: { lock: Script }) => Promise<boolean>;
}

export class DefaultBackend implements Backend {
  nodeUri: string;
  indexer: Indexer;

  constructor(payload: { nodeUri: string }) {
    this.nodeUri = payload.nodeUri;
    this.indexer = new Indexer(payload.nodeUri);
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
