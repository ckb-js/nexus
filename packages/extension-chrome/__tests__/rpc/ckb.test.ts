import { createTransactionFromSkeleton, TransactionSkeleton } from '@ckb-lumos/helpers';
import { Backend } from '../../src/services/ownership/backend';
import { createMockBackend } from '../helpers/mockBackend';
import { createTestRpcServer, RpcTestHelper } from './helper';

describe('CKB method', () => {
  let server: RpcTestHelper;
  let mockBackend: Backend;
  const chainInfo = {
    chain: '',
    medianTime: '',
    epoch: '',
    difficulty: '',
    isInitialBlockDownload: false,
    alerts: [],
  };
  const txHash = '0xa0ef4eb5f4ceeb08a4c8524d84c5da95dce2f608e0ca2ec8091191b0f330c6e3';

  beforeEach(async () => {
    mockBackend = createMockBackend({
      getBlockchainInfo: () => Promise.resolve(chainInfo),
      sendTransaction: () => Promise.resolve(txHash),
    });

    jest.spyOn(mockBackend, 'getBlockchainInfo');
    jest.spyOn(mockBackend, 'sendTransaction');

    server = createTestRpcServer({
      backendProvider: () => ({
        resolve: () => mockBackend,
      }),
    });
    const { request, factory } = server;
    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockResolvedValue();
    await request('wallet_enable');
  });
  it('ckb_getBlockchainInfo', async () => {
    const { request } = server;
    await expect(request('ckb_getBlockchainInfo')).resolves.toBe(chainInfo);
    expect(mockBackend.getBlockchainInfo).toBeCalledTimes(1);
  });

  it('ckb_sendTransaction', async () => {
    const { request } = server;
    const tx = createTransactionFromSkeleton(TransactionSkeleton());
    await expect(request('ckb_sendTransaction', { tx, outputsValidator: 'passthrough' })).resolves.toBe(txHash);
    expect(mockBackend.sendTransaction).toBeCalledWith(tx, 'passthrough');
  });
});
