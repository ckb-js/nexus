import { createTestRpcServer } from './helper';

jest.mock('@ckb-lumos/helpers', () =>
  Object.assign({}, jest.requireActual('@ckb-lumos/helpers'), {
    createTransactionSkeleton: jest.fn(),
    transactionSkeletonToObject: jest.fn(),
  }),
);
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
});
describe('RPC wallet_fullOwnership_signData', () => {
  it('Should invoke and react the results of platformService#requestSignData', async () => {
    const data = '0xe68891e5a5bde683b3e5819ae99988e5b08fe5a790e79a84e78b97';
    const { request, factory } = createTestRpcServer();
    const platformService = factory.get('platformService');

    jest.spyOn(platformService, 'requestSignData').mockImplementation(() => Promise.reject());

    await expect(request('wallet_fullOwnership_signData', { data })).rejects.toThrowError(/has rejected/);

    jest
      .spyOn(platformService, 'requestSignData')
      .mockImplementation(() => Promise.resolve({ password: 'Genshin Impact' }));

    await expect(request('wallet_fullOwnership_signData', { data })).resolves.toBe('mooooooock signed message');
  });
});

describe('RPC wallet_fullOwnership_signTransaction', () => {
  const transactionSkeletonToObject: jest.Mock = require('@ckb-lumos/helpers').transactionSkeletonToObject;
  const createTransactionSkeleton: jest.Mock = require('@ckb-lumos/helpers').createTransactionSkeleton;
  it('should works', async () => {
    transactionSkeletonToObject.mockReturnValue({ inputs: [] });
    const { request, factory } = createTestRpcServer();
    const platformService = factory.get('platformService');

    jest.spyOn(platformService, 'requestSignTransaction').mockImplementation(() => Promise.reject());

    await expect(request('wallet_fullOwnership_signTransaction', {} as any)).rejects.toThrowError(/has rejected/);

    jest
      .spyOn(platformService, 'requestSignTransaction')
      .mockImplementation(() => Promise.resolve({ password: 'Genshin Impact' }));

    await expect(request('wallet_fullOwnership_signTransaction', {} as any)).resolves.toBe(
      'mooooock signed transaction witness',
    );
  });
  it("Should throw error when can't fetch the cell", async () => {
    createTransactionSkeleton.mockRejectedValue('reject');
    const { request } = createTestRpcServer();

    await expect(request('wallet_fullOwnership_signTransaction', {} as any)).rejects.toThrowError(
      /Can not fetch the cell/,
    );

    createTransactionSkeleton.mockResolvedValue({});
    transactionSkeletonToObject.mockReturnValue({ inputs: [null] });
    await expect(request('wallet_fullOwnership_signTransaction', {} as any)).rejects.toThrowError(
      'Can not fetch your input cells, please check they are all valid and live.',
    );
  });
});
