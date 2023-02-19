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
}
