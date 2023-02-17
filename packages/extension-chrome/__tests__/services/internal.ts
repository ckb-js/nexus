import { createInternalService, FULL_OWNERSHIP_EXTERNAL_PARENT_PATH } from '../../src/services/internal';
import { createKeystoreService } from '../../src/services/keystore';
import { createInMemoryStorage } from '../../src/services/storage';
import { createConfigService } from '../../src/services/config';

test('internal service', async () => {
  const storage = createInMemoryStorage();
  const internalService = createInternalService({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    browser: {} as any,
    keystoreService: createKeystoreService({ storage }),
    configService: createConfigService({ storage }),
  });

  await internalService.initWallet({
    nickname: 'Nexus Dev',
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    password: '123456',
  });

  const configService = createConfigService({ storage });
  const keystoreService = createKeystoreService({ storage });

  await expect(internalService.isInitialized()).resolves.toBe(true);
  await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

  const publicKey = await keystoreService.getExtendedPublicKey({
    password: '123456',
    path: FULL_OWNERSHIP_EXTERNAL_PARENT_PATH + '/0',
  });
  expect(publicKey).not.toBeFalsy();
  await expect(configService.getConfig()).resolves.toMatchObject({ nickname: 'Nexus Dev' });
});
