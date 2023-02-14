import { createConfigService } from '../../src/services/config';
import { createInMemoryStorage } from '../../src/services/storage';

describe('ConfigService', () => {
  it('should works when initConfigService', async () => {
    const service = createConfigService({ storage: createInMemoryStorage() });
    await service.setConfig({
      config: {
        nickname: 'Nickname',
        whitelist: [],
        selectedNetwork: '1',
        networks: [{ networkName: 'ckb', displayName: 'Mainnet', rpcUrl: 'https://mainnet.ckb.dev', id: '1' }],
      },
    });
  });

  // TODO add more tests
});
