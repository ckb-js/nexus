import { addMethod } from './server';

addMethod('ckb_getBlockchainInfo', async (_, { resolveService }) => {
  const backend = await resolveService('backendProvider').resolve();
  return backend.getBlockchainInfo();
});
