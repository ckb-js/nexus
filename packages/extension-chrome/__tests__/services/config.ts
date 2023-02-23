import { createConfigService } from '../../src/services/config';
import { createInMemoryStorage } from '../../src/services/storage';
import { ConfigService } from '@nexus-wallet/types';
import { LIB_VERSION } from '@nexus-wallet/utils';

let service: ConfigService;
const fakeConfig = {
  nickname: 'Nickname',
  whitelist: [{ host: 'google.com', favicon: 'https://google.com/favicon.ico' }],
  selectedNetwork: '1',
  networks: [{ networkName: 'ckb', displayName: 'Mainnet', rpcUrl: 'https://mainnet.ckb.dev', id: '1' }],
};

beforeEach(async () => {
  service = createConfigService({ storage: createInMemoryStorage() });
});

it('should throw when trying to get config before set', async () => {
  await expect(service.getConfig()).rejects.toThrowError();
});

describe('ConfigService', () => {
  beforeEach(() => service.setConfig({ config: fakeConfig }));

  it('getConfig', async () => {
    const config = await service.getConfig();
    expect(config).toEqual({
      nickname: 'Nickname',
      whitelist: [{ host: 'google.com', favicon: 'https://google.com/favicon.ico' }],
      selectedNetwork: '1',
      networks: [{ networkName: 'ckb', displayName: 'Mainnet', rpcUrl: 'https://mainnet.ckb.dev', id: '1' }],
      version: LIB_VERSION,
    });
  });

  it('setConfig with object', async () => {
    await service.setConfig({ config: { ...fakeConfig, nickname: 'Nickname 2' } });
    await expect(service.getConfig()).resolves.toEqual({
      ...fakeConfig,
      nickname: 'Nickname 2',
      version: LIB_VERSION,
    });
  });

  it('should setConfig with localhost hostname', async () => {
    await expect(
      service.setConfig({
        config: {
          ...fakeConfig,
          whitelist: [
            {
              favicon: 'http://localhost:9180/favicon.ico',
              host: 'localhost',
            },
          ],
        },
      }),
    );
    await expect(service.getConfig()).resolves.toEqual({
      ...fakeConfig,
      whitelist: [
        {
          favicon: 'http://localhost:9180/favicon.ico',
          host: 'localhost',
        },
      ],
      version: LIB_VERSION,
    });
  });

  it('should setConfig with localhost:port hostname', async () => {
    await expect(
      service.setConfig({
        config: {
          ...fakeConfig,
          whitelist: [
            {
              favicon: 'http://example.com/favicon.ico',
              host: 'localhost:9180',
            },
          ],
        },
      }),
    );
    await expect(service.getConfig()).resolves.toEqual({
      ...fakeConfig,
      whitelist: [
        {
          favicon: 'http://example.com/favicon.ico',
          host: 'localhost:9180',
        },
      ],
      version: LIB_VERSION,
    });
  });

  it('setConfig with callback', async () => {
    await service.setConfig({
      config: (draft) => {
        draft.nickname = 'Nickname 3';
      },
    });

    await expect(service.getConfig()).resolves.toMatchObject({ nickname: 'Nickname 3' });
  });

  it('should throw when setConfig with wrong selectedNetwork', async () => {
    await expect(
      service.setConfig({
        config: { ...fakeConfig, selectedNetwork: '2' },
      }),
    ).rejects.toThrowError();
  });

  it('should throw when setConfig with wrong hostname', async () => {
    await expect(
      service.setConfig({
        config: {
          ...fakeConfig,
          whitelist: [
            {
              favicon: 'http://localhost:9180/favicon.ico',
              host: 'localhost:123123123',
            },
          ],
        },
      }),
    ).rejects.toThrowError();
  });

  it('should throw when setConfig with wrong url', async () => {
    const wrongSetConfig = service.setConfig({
      config: (draft) => {
        draft.networks = [{ ...fakeConfig.networks[0], rpcUrl: 'wrong-url' }];
      },
    });

    await expect(wrongSetConfig).rejects.toThrowError();
  });
});
