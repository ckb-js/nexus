import { createFullOwnershipService, createWatchtower } from '../../../src/services/ownership';
import { createMockModule } from '../../helpers/createMockModule';
import { KeystoreService } from '@nexus-wallet/types';
import { createScriptInfoDb } from '../../../src/services/ownership/storage';
import { createConfigService } from '../../../src/services/config';
import { createMockStorage } from '../../helpers/mockStorage';
import { asyncSleep } from '../../helpers/utils';
import { mockBackend } from './mockBackend';
import { mockPlatformService } from '../../helpers';
import { bytes } from '@ckb-lumos/codec';

describe('FullOwnership', () => {
  describe('getOffChainLocks', function () {
    it('should get the first 20 locks of the external full-ownership', async () => {
      const storage = createMockStorage();
      const configService = createConfigService({ storage });
      const keystoreService = createMockModule<KeystoreService>({
        getPublicKeyByPath: () => bytes.hexify(Buffer.alloc(32)),
      });
      const ownershipService = createFullOwnershipService({
        configService,
        keystoreService,
        platformService: mockPlatformService,
        storage,
        backendProvider: { resolve: () => mockBackend },
      });

      const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });
      const watchtower = createWatchtower({ db, keystoreService, backend: mockBackend });

      watchtower.run();
      await asyncSleep(100);
      watchtower.stop();

      const locks = await ownershipService.getOffChainLocks({});
      expect(locks).toHaveLength(20);
    });

    it.skip('should get the first 20 locks of the internal full-ownership', () => {});
  });
});
