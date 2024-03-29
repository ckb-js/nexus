import { createInMemoryStorage } from '../../src/services/storage';
import { createModulesFactory } from '../../src/services/factory';
import { MOCK_PLATFORM_PASSWORD, mockPlatformService } from '../helpers';
import { FULL_OWNERSHIP_EXTERNAL_PARENT_PATH } from '../../src/services/ownership';

test('internal service', async () => {
  const factory = createModulesFactory({ storage: createInMemoryStorage, platform: () => mockPlatformService });
  const internalService = factory.get('internalService');

  await internalService.initWallet({
    nickname: 'Nexus Dev',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    password: MOCK_PLATFORM_PASSWORD,
  });

  const configService = factory.get('configService');
  const keystoreService = factory.get('keystoreService');

  await expect(internalService.isInitialized()).resolves.toBe(true);
  await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

  const publicKey = await keystoreService.getPublicKeyByPath({
    path: FULL_OWNERSHIP_EXTERNAL_PARENT_PATH + '/0',
  });
  expect(publicKey).not.toBeFalsy();
  await expect(configService.getConfig()).resolves.toMatchObject({ nickname: 'Nexus Dev' });
});
