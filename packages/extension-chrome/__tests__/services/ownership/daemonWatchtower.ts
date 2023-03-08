import { createDaemonWatchtower } from '../../../src/services/ownership/watchtower/daemon';
import { createTestRpcServer } from '../../rpc/helper';
import { createMockBackend } from '../../helpers/mockBackend';
import { asyncSleep } from '@nexus-wallet/utils';
import { createInMemoryStorage } from '../../../src/services/storage';
import { setLogLevel } from '@nexus-wallet/utils/lib/logger';
import { createMockModule } from '../../helpers/createMockModule';
import { KeystoreService } from '@nexus-wallet/types';

// disable log in this test
setLogLevel(9999);

describe('daemonWatchtower', () => {
  it('should watchtower not launch if wallet is not initialized', async () => {
    const { factory } = createTestRpcServer({
      // init with empty storage
      storage: createInMemoryStorage,
      backendProvider: () => ({ resolve: () => createMockBackend() }),
    });

    const onWatchtowerLaunched = jest.fn();
    const watchtower = createDaemonWatchtower(factory, { onWatchtowerLaunched });
    watchtower.run();

    await asyncSleep(50);
    expect(onWatchtowerLaunched).not.toBeCalled();

    watchtower.stop();
  });

  it('should watchtower launch if wallet is initialized', async () => {
    const { factory } = createTestRpcServer({
      backendProvider: () => ({ resolve: () => createMockBackend() }),
      // speed up the test
      keystoreService: () =>
        createMockModule<KeystoreService>({ hasInitialized: () => true, getPublicKeyByPath: async () => '0x' }),
    });

    // make sure network is starts with mainnet
    const configService = factory.get('configService');
    await configService.setSelectedNetwork({ id: 'mainnet' });

    const onWatchtowerLaunched = jest.fn();
    const watchtower = createDaemonWatchtower(factory, { onWatchtowerLaunched, pollIntervalMs: 50 });
    watchtower.run();

    await asyncSleep(50);
    expect(onWatchtowerLaunched).toBeCalledTimes(1);

    await configService.setSelectedNetwork({ id: 'testnet' });
    await asyncSleep(50);

    expect(onWatchtowerLaunched).toBeCalledTimes(2);

    watchtower.stop();
  });
});
