import fetchMock from 'jest-fetch-mock';
import { createRpcClient, loadSecp256k1ScriptDep } from '../../../../src/services/ownership/backend/backendUtils';
import { bytes } from '@ckb-lumos/codec';

describe('rpcClient', () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('should not throw error when JSONRpc returns objects', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve(
        JSON.stringify({
          id: 0,
          jsonrpc: '2.0',
          objects: [],
        }),
      ),
    );
    const client = createRpcClient('mockUrl');
    await expect(client.request('some_method', {})).resolves.not.toThrow();
  });
  it('should not throw error when load secp256 cellDeps', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve(
        JSON.stringify({
          jsonrpc: '2.0',
          result: {
            header: {},
            proposals: [],
            transactions: [
              {
                outputs: [
                  {},
                  {
                    type: {
                      args: bytes.hexify(Buffer.alloc(32)),
                      code_hash: bytes.hexify(Buffer.alloc(32)),
                      hash_type: 'type',
                    },
                  },
                ],
              },
              {
                hash: '0x02',
              },
            ],
            uncles: [],
          },
          id: 2,
        }),
      ),
    );
    await expect(loadSecp256k1ScriptDep({ nodeUrl: 'mockUrl' })).resolves.toBeDefined();
  });
  it('should throw error when JSONRpc returns error', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve(
        JSON.stringify({
          id: 0,
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: 'Invalid params.',
          },
        }),
      ),
    );
    const client = createRpcClient('mockUrl');
    await expect(client.request('some_method', {})).rejects.toThrow(/Request CKB node failed/);
  });
});
