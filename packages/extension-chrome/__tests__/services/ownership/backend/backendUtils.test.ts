import fetchMock from 'jest-fetch-mock';
import { loadSecp256k1ScriptDep } from '../../../../src/services/ownership/backend/backendUtils';
import { bytes } from '@ckb-lumos/codec';

describe('rpcClient', () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('loadSecp256k1ScriptDep should match snapshot', async () => {
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
    expect(await loadSecp256k1ScriptDep({ nodeUrl: 'mockUrl' })).toMatchSnapshot();
  });
});
