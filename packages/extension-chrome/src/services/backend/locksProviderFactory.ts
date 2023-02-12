import { Backend } from './backend';
import { KeystoreService, Storage } from '@nexus-wallet/types';
import { StorageSchema } from './locksManager';
import { LocksProvider } from './locksProvider';
import { getAddressInfoDetailsFromStorage } from './utils';

export class LocksProviderFactory {
  ready: boolean;
  backend: Backend;
  keystoreService: KeystoreService;
  storage: Storage<StorageSchema>;

  constructor(config: { backend: Backend; storage: Storage<StorageSchema>; keystoreService: KeystoreService }) {
    this.backend = config.backend;
    this.keystoreService = config.keystoreService;
    this.storage = config.storage;
    this.ready = true;
  }

  async getFullOwnershipLocksProvider(): Promise<LocksProvider> {
    const lockDetail = await getAddressInfoDetailsFromStorage({ storage: this.storage, keyName: 'fullOwnership' });
    return new LocksProvider({
      lockDetail,
      backend: this.backend,
      keystoreService: this.keystoreService,
    });
  }
  async getRuleBasedOwnershipLocksProvider(): Promise<LocksProvider> {
    const lockDetail = await getAddressInfoDetailsFromStorage({ storage: this.storage, keyName: 'ruleBasedOwnership' });
    return new LocksProvider({
      lockDetail,
      backend: this.backend,
      keystoreService: this.keystoreService,
    });
  }
}
