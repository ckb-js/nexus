import { createTestRpcServer } from './helper';
import { createInMemoryStorage } from '../../src/services/storage';

describe('rpc/middleware', () => {
  it('should request be baned when Nexus is not initialized', async () => {
    const { request, probeStop } = createTestRpcServer({ storage: createInMemoryStorage });

    await expect(request('unknown_method')).rejects.toThrowError(/Nexus is not initialized/);
    await expect(request('wallet_enable')).rejects.toThrowError(/Nexus is not initialized/);
    probeStop();
  });

  it('should request be baned when requester is not in whitelist', async () => {
    const { request, probeStop } = createTestRpcServer();

    await expect(request('other_method')).rejects.toThrowError(/whitelist/);
    await expect(request('wallet_enable')).resolves.not.toThrowError();

    // after calling wallet_enable should be able to call other methods
    // but other methods is not registered in RPC
    await expect(request('other_method')).rejects.not.toThrowError(/whitelist/);
    await expect(request('other_method')).rejects.toThrowError(/Method not found/);
    probeStop();
  });
});
