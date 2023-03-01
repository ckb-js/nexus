import { createInMemoryStorage } from '../../src/services/storage';
import { FULL_OWNERSHIP_EXTERNAL_PARENT_PATH } from '../../src/services/internal';
import { createModulesFactory } from '../../src/services/factory';
import { mockPlatformService } from '../helpers';

test('internal service', async () => {
  const factory = createModulesFactory({ storage: createInMemoryStorage, platform: () => mockPlatformService });
  const internalService = factory.get('internalService');

  await internalService.initWallet({
    nickname: 'Nexus Dev',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    password: '123456',
  });

  const configService = factory.get('configService');
  const keystoreService = factory.get('keystoreService');

  await expect(internalService.isInitialized()).resolves.toBe(true);
  await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

  const publicKey = await keystoreService.getExtendedPublicKey({
    password: '123456',
    path: FULL_OWNERSHIP_EXTERNAL_PARENT_PATH + '/0',
  });
  expect(publicKey).not.toBeFalsy();
  await expect(configService.getConfig()).resolves.toMatchObject({ nickname: 'Nexus Dev' });
});
