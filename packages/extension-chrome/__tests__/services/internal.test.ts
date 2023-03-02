import { createInternalService, FULL_OWNERSHIP_EXTERNAL_PARENT_PATH } from '../../src/services/internal';
import { createKeystoreService } from '../../src/services/keystore';
import { createInMemoryStorage } from '../../src/services/storage';
import { createConfigService } from '../../src/services/config';
import { MOCK_PLATFORM_PASSWORD, mockPlatformService } from '../helpers';

test('internal service', async () => {
  const storage = createInMemoryStorage();
  const internalService = createInternalService({
    keystoreService: createKeystoreService({ storage }),
    configService: createConfigService({ storage }),
    platformService: mockPlatformService,
  });

  await internalService.initWallet({
    nickname: 'Nexus Dev',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    password: MOCK_PLATFORM_PASSWORD,
  });

  const configService = createConfigService({ storage });
  const keystoreService = createKeystoreService({ storage });

  await expect(internalService.isInitialized()).resolves.toBe(true);
  await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

  const publicKey = await keystoreService.getExtendedPublicKey({
    path: FULL_OWNERSHIP_EXTERNAL_PARENT_PATH + '/0',
  });
  expect(publicKey).not.toBeFalsy();
  await expect(configService.getConfig()).resolves.toMatchObject({ nickname: 'Nexus Dev' });
});
