import { createTestRpcServer } from './helper';
import { createInMemoryStorage } from '../../src/services/storage';
import { errorMiddleware } from '../../src/rpc/middlewares/errorMiddleware';
import { createJSONRPCRequest, JSONRPCServer } from 'json-rpc-2.0';
import { NexusCommonErrors, NexusError } from '../../src/errors';
import { parameterValidateMiddleware } from '../../src/rpc/middlewares/parameterValidateMiddleware';
import { ServerParams } from '../../src/rpc/types';
import { z } from 'zod';

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
    server.addMethod('unknown', () => {
      throw NexusError.create('Unknown');
    });

    const res = await server.receive(createJSONRPCRequest(0, 'unknown'));
    expect(res?.error?.message).toMatch(/Unknown/);

    server.addMethod('object', () => {
      throw NexusCommonErrors.RequestCkbFailed({ method: 'some_method', params: [] });
    });
    const res2 = await server.receive(createJSONRPCRequest(0, 'object'));
    expect(res2?.error?.message).toMatch(/request.*failed/i);
    expect(res2?.error?.data).toMatchObject({ method: 'some_method', params: [] });
  });
});

describe('Middlewares#parameterValidationMiddleware', () => {
  let server: JSONRPCServer<ServerParams>;
  beforeEach(() => {
    server = new JSONRPCServer<ServerParams>();
    server.applyMiddleware(parameterValidateMiddleware);
  });

  it('should skip when method have no validator', async () => {
    server.addMethod('insert_Paimon', jest.fn());
    await expect(server.receive(createJSONRPCRequest(0, 'insert_Paimon', 'paimon'))).resolves.toBeTruthy();
  });
  it('should throw error when params is invalid', async () => {
    server.addMethod('insert_Paimon', jest.fn().mockReturnValue('ok'));
    const { validators } = jest.requireActual<typeof import('../../src/rpc/server')>('../../src/rpc/server');
    validators.insert_Paimon = z.object({ name: z.string() });
    const failedRes = await server.receive(createJSONRPCRequest(0, 'insert_Paimon', { nome: 'wrong' }));
    expect(failedRes?.error?.message).toMatch(/Validation error/);

    const successRes = await server.receive(createJSONRPCRequest(0, 'insert_Paimon', { name: 'paimon' }));
    expect(successRes?.result).toBe('ok');
  });
});
