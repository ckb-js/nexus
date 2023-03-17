/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from '@ckb-lumos/lumos';
import { MOCK_PLATFORM_URL } from '../helpers';
import { createTestRpcServer } from './helper';

describe('RPC wallet_enable', () => {
  it('should request be allowed when Nexus is initialized', async () => {
    const { request, factory } = createTestRpcServer();

    const keystoreService = factory.get('keystoreService');
    await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.reject());

    await expect(request('wallet_enable')).rejects.toThrowError(/has rejected/);

    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    await expect(request('wallet_enable')).resolves.not.toThrowError();
  });
  it('should wallet_enable return nickname', async () => {
    const { request } = createTestRpcServer();
    await expect(request('wallet_enable')).resolves.toEqual({ nickname: 'Nexus Dev' });
  });
});
describe('RPC wallet_fullOwnership', () => {
  it('should request wallet_fullOwnership_getOffChainLocks call ownership service with default parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest.spyOn(fullOwnershipService, 'getOffChainLocks').mockImplementation(() => Promise.resolve([]));
    await request('wallet_fullOwnership_getOffChainLocks', {});
    expect(fullOwnershipService.getOffChainLocks).toBeCalledTimes(1);
    expect(fullOwnershipService.getOffChainLocks).toBeCalledWith({});
    jest.clearAllMocks();
  });
  it('should request wallet_fullOwnership_getOffChainLocks call ownership service with `change: internal`', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest.spyOn(fullOwnershipService, 'getOffChainLocks').mockImplementation(() => Promise.resolve([]));
    await request('wallet_fullOwnership_getOffChainLocks', { change: 'internal' });
    expect(fullOwnershipService.getOffChainLocks).toBeCalledTimes(1);
    expect(fullOwnershipService.getOffChainLocks).toBeCalledWith({ change: 'internal' });
    jest.clearAllMocks();
  });

  it('should request wallet_fullOwnership_getOnChainLocks call ownership service with default parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest
      .spyOn(fullOwnershipService, 'getOnChainLocks')
      .mockImplementation(() => Promise.resolve({ cursor: '', objects: [] }));
    await request('wallet_fullOwnership_getOnChainLocks', {});
    expect(fullOwnershipService.getOnChainLocks).toBeCalledTimes(1);
    expect(fullOwnershipService.getOnChainLocks).toBeCalledWith({});
    jest.clearAllMocks();
  });
  it('should request wallet_fullOwnership_getOnChainLocks call ownership service with `change: internal, cursor: some_cursor`', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest
      .spyOn(fullOwnershipService, 'getOnChainLocks')
      .mockImplementation(() => Promise.resolve({ cursor: '', objects: [] }));
    await request('wallet_fullOwnership_getOnChainLocks', { change: 'internal', cursor: 'some_cursor' });
    expect(fullOwnershipService.getOnChainLocks).toBeCalledTimes(1);
    expect(fullOwnershipService.getOnChainLocks).toBeCalledWith({ change: 'internal', cursor: 'some_cursor' });
    jest.clearAllMocks();
  });

  it('should request wallet_fullOwnership_getLiveCells call ownership service with empty parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest
      .spyOn(fullOwnershipService, 'getLiveCells')
      .mockImplementation(() => Promise.resolve({ cursor: '', objects: [] }));
    await request('wallet_fullOwnership_getLiveCells', {});
    expect(fullOwnershipService.getLiveCells).toBeCalledTimes(1);
    expect(fullOwnershipService.getLiveCells).toBeCalledWith({});
    jest.clearAllMocks();
  });

  it('should request wallet_fullOwnership_getLiveCells call ownership service with proper parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest
      .spyOn(fullOwnershipService, 'getLiveCells')
      .mockImplementation(() => Promise.resolve({ cursor: '', objects: [] }));
    await request('wallet_fullOwnership_getLiveCells', { cursor: 'some_cursor' });
    expect(fullOwnershipService.getLiveCells).toBeCalledTimes(1);
    expect(fullOwnershipService.getLiveCells).toBeCalledWith({ cursor: 'some_cursor' });
    jest.clearAllMocks();
  });

  it('should request wallet_fullOwnership_signData call ownership service with proper parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest.spyOn(fullOwnershipService, 'signData').mockImplementation(() => Promise.resolve(''));
    await request('wallet_fullOwnership_signData', {
      data: '0x1234',
      lock: { codeHash: '0x1234', hashType: 'type', args: '0x01' },
    });
    expect(fullOwnershipService.signData).toBeCalledTimes(1);
    expect(fullOwnershipService.signData).toBeCalledWith({
      data: '0x1234',
      lock: { codeHash: '0x1234', hashType: 'type', args: '0x01' },
      url: MOCK_PLATFORM_URL,
    });
    jest.clearAllMocks();
  });

  it('should request wallet_fullOwnership_signTx call ownership service with proper parameter', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest.spyOn(fullOwnershipService, 'signTransaction').mockImplementation(() => Promise.resolve([]));
    await request('wallet_fullOwnership_signTransaction', { tx: createFakeTransaction() });
    expect(fullOwnershipService.signTransaction).toBeCalledTimes(1);
    expect(fullOwnershipService.signTransaction).toBeCalledWith({
      tx: createFakeTransaction(),
      url: MOCK_PLATFORM_URL,
    });
    jest.clearAllMocks();
  });
});

function createFakeTransaction(): Transaction {
  return {
    version: '0x0',
    cellDeps: [],
    headerDeps: [],
    inputs: [{ previousOutput: { txHash: '0x', index: '0x0' }, since: '0x0' }],
    outputs: [{ capacity: '0x0', lock: { codeHash: '0x', hashType: 'type', args: '0x' } }],
    outputsData: ['0x'],
    witnesses: ['0x'],
  };
}
