import { createTestRpcServer } from './helper';
import { createInMemoryStorage } from '../../src/services/storage';
import { errorMiddleware } from '../../src/rpc/middlewares/errorMiddleware';
import { createJSONRPCRequest, JSONRPCServer } from 'json-rpc-2.0';
import { throwNexusError } from '../../src/errors';

describe('Middlewares#whitelistMiddleware', () => {
  it('should request be baned when Nexus is not initialized', async () => {
    const { request } = createTestRpcServer({ storage: createInMemoryStorage });

    await expect(request('unknown_method')).rejects.toThrowError(/Nexus is not initialized/);
    await expect(request('wallet_enable')).rejects.toThrowError(/Nexus is not initialized/);
  });

  it('should request be baned when requester is not in whitelist', async () => {
    const { request } = createTestRpcServer();

    await expect(request('other_method')).rejects.toThrowError(/whitelist/);
    await expect(request('wallet_enable')).resolves.not.toThrowError();

    // after calling wallet_enable should be able to call other methods
    // but other methods is not registered in RPC
    await expect(request('other_method')).rejects.not.toThrowError(/whitelist/);
    await expect(request('other_method')).rejects.toThrowError(/Method not found/);
  });
});

describe('Middlewares#errorMiddleware', () => {
  it('should receive NexusError response when the NexusError was thrown', async () => {
    const server = new JSONRPCServer();

    server.applyMiddleware(errorMiddleware);
    server.addMethod('unknown', () => throwNexusError('Unknown', null));

    const res = await server.receive(createJSONRPCRequest(0, 'unknown'));
    expect(res?.error?.message).toMatch(/Unknown/);

    server.addMethod('object', () => throwNexusError('Something wrong', { key: 'value' }));
    const res2 = await server.receive(createJSONRPCRequest(0, 'object'));
    expect(res2?.error?.message).toMatch(/Something wrong/);
    expect(res2?.error?.data).toMatchObject({ key: 'value' });
  });
});
