import { createTestRpcServer } from './helper';
import { createInMemoryStorage } from '../../src/services/storage';
import { asyncSleep } from '@nexus-wallet/utils';

it('should the networkChanged fired when config has updated', async () => {
  const { ckb } = createTestRpcServer();

  const mockListener = jest.fn();
  // make sure the network is mainnet at the beginning
  await ckb.request({ method: 'debug_setConfig', params: { selectedNetwork: 'mainnet' } });

  ckb.on('networkChanged', mockListener);
  await ckb.request({ method: 'debug_setConfig', params: { selectedNetwork: 'testnet' } });
  await ckb.request({ method: 'debug_setConfig', params: { selectedNetwork: 'testnet' } });
  await ckb.request({ method: 'debug_setConfig', params: { selectedNetwork: 'testnet' } });
  await asyncSleep(50);

  expect(mockListener).toHaveBeenCalledTimes(1);
  expect(mockListener).toHaveBeenCalledWith('ckb_testnet');
});

it('should the walletInitialized fired when wallet has initialized', async () => {
  const { ckb } = createTestRpcServer({ storage: createInMemoryStorage });

  const mockListener = jest.fn();

  ckb.on('walletInitialized', mockListener);
  await ckb.request({ method: 'debug_initWallet' });
  await asyncSleep(50);

  expect(mockListener).toHaveBeenCalled();
  // crypto is a slow module, so we need to increase the timeout
}, 10_000);
