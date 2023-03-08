import { daemonRunWatchtower } from '../../../src/services/ownership/watchtower/daemon';
import { createTestRpcServer } from '../../rpc/helper';
import { createMockBackend } from '../../helpers/mockBackend';
import { asyncSleep } from '@nexus-wallet/utils';
import { createInMemoryStorage } from '../../../src/services/storage';
import { setLogLevel } from '@nexus-wallet/utils/lib/logger';

// disable log in this test
setLogLevel(9999);

describe('daemonRunWatchtower', () => {
  it('should watchtower not launch if wallet is not initialized', async () => {
    const { factory } = createTestRpcServer({
      // init with empty storage
      storage: createInMemoryStorage,
      backendProvider: () => ({ resolve: () => createMockBackend() }),
    });

    const onWatchtowerLaunched = jest.fn();
    void daemonRunWatchtower(factory, { onWatchtowerLaunched });
    await asyncSleep(50);
    expect(onWatchtowerLaunched).not.toBeCalled();
  });

  it('should watchtower launch if wallet is initialized', async () => {
    const { factory } = createTestRpcServer({
      backendProvider: () => ({ resolve: () => createMockBackend() }),
    });

    // make sure network is starts with mainnet
    const configService = factory.get('configService');
    await configService.setSelectedNetwork({ id: 'mainnet' });

    const onWatchtowerLaunched = jest.fn();
    void daemonRunWatchtower(factory, { onWatchtowerLaunched, pollIntervalMs: 50 });
    await asyncSleep(50);
    expect(onWatchtowerLaunched).toBeCalledTimes(1);

    await configService.setSelectedNetwork({ id: 'testnet' });
    await asyncSleep(50);

    expect(onWatchtowerLaunched).toBeCalledTimes(2);
    // watchtower init will take some time
  }, 20_000);
});
