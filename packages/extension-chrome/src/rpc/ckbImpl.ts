import { addMethod } from './server';

addMethod('ckb_getBlockchainInfo', async (_, { resolveService }) => {
  const backend = await resolveService('backendProvider').resolve();
  return backend.getBlockchainInfo();
});

addMethod('ckb_sendTransaction', async ({ tx }, { resolveService }) => {
  const backendProvider = await resolveService('backendProvider').resolve();
  return backendProvider.sendTransaction(tx);
});
