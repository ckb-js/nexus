import { createTestRpcServer } from './helper';
import { asyncSleep } from '@ckb-lumos/e2e-test/src/utils';
import { createInMemoryStorage } from '../../src/services/storage';

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

it('should trigger networkChanged when setSelectedNetwork', async () => {
  const { factory, ckb } = createTestRpcServer();

  const configService = factory.get('configService');
  // make sure the network is mainnet at the beginning
  await configService.setSelectedNetwork({ id: 'testnet' });

  const mockListener = jest.fn();
  ckb.on('networkChanged', mockListener);
  await configService.setSelectedNetwork({ id: 'mainnet' });

  await asyncSleep(10);
  expect(mockListener).toHaveBeenCalledTimes(1);
  expect(mockListener).toHaveBeenCalledWith('ckb');
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
