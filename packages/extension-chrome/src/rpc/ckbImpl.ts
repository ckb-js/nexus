import { ZSendTransactionPayload } from './schema';
import { addMethod, addMethodValidator } from './server';

addMethod('ckb_getBlockchainInfo', async (_, { resolveService }) => {
  const backend = await resolveService('backendProvider').resolve();
  return backend.getBlockchainInfo();
});

addMethod('ckb_sendTransaction', async ({ tx, outputsValidator }, { resolveService }) => {
  const backendProvider = await resolveService('backendProvider').resolve();
  return backendProvider.sendTransaction(tx, outputsValidator);
});

// FIXME: the type system is not working here
// it seems a Typescript bug
// type T1 = Parameters<RpcMethods['ckb_sendTransaction']>[0];
// type T2 = z.infer<typeof ZSendTransactionPayload>
// type T3 = ObjectEquals<T1, T2> // true?
addMethodValidator('ckb_sendTransaction', ZSendTransactionPayload as never);
