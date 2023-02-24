import { createTestRpcServer } from './helper';

describe('RPC wallet_enable', () => {
  it('should request be allowed when Nexus is initialized', async () => {
    const { request, factory, probeStop } = createTestRpcServer();

    const keystoreService = factory.get('keystoreService');
    await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.reject());

    await expect(request('wallet_enable')).rejects.toThrowError(/has rejected/);

    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    await expect(request('wallet_enable')).resolves.not.toThrowError();
    probeStop();
  });
});
