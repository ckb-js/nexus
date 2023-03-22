import { createTestRpcServer } from './helper';
import { createInMemoryStorage } from '../../src/services/storage';
import { errorMiddleware } from '../../src/rpc/middlewares/errorMiddleware';
import { createJSONRPCRequest, JSONRPCServer } from 'json-rpc-2.0';
import { NexusCommonErrors, NexusError } from '../../src/errors';
import { createParameterValidateMiddleware } from '../../src/rpc/middlewares/parameterValidateMiddleware';
import { ServerParams } from '../../src/rpc/types';
import { z, ZodType } from 'zod';

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
  let validators: Record<string, ZodType<unknown>>;

  beforeEach(() => {
    validators = {};
    server = new JSONRPCServer<ServerParams>();
    server.applyMiddleware(createParameterValidateMiddleware(validators));
  });

  it('should skip when method have no validator', async () => {
    server.addMethod('other_method', jest.fn());
    await expect(server.receive(createJSONRPCRequest(0, 'other_method', 'Satoshi'))).resolves.toBeTruthy();
  });

  it('should throw error when params is invalid', async () => {
    server.addMethod('restricted_method', jest.fn().mockReturnValue('ok'));
    validators.restricted_method = z.object({ name: z.string() });
    await expect(
      server.receive(createJSONRPCRequest(0, 'restricted_method', { nome: 'wrong' })),
    ).resolves.toMatchObject({
      error: { message: 'Validation error: Required at "name"' },
    });

    await expect(
      server.receive(createJSONRPCRequest(0, 'restricted_method', { name: 'nakamoto' })),
    ).resolves.toMatchObject({
      result: 'ok',
    });
  });
});
