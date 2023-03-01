import { addMethod } from './server';

if (process.env.NODE_ENV === 'development') {
  addMethod('debug_initWallet', async (_, { resolveService }) => {
    const internalService = await resolveService('internalService');
    await internalService.initWallet({
      nickname: 'Nexus Dev',
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      password: '123456',
    });
  });

  addMethod('debug_setConfig', async (payload, { resolveService }) => {
    const configService = resolveService('configService');
    await configService.setConfig({ config: payload });
  });

  addMethod('debug_getConfig', async (_, { resolveService }) => {
    const configService = resolveService('configService');
    return configService.getConfig();
  });
}
