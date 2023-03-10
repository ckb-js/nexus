import { createTestRpcServer } from './helper';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Parameter validation', () => {
  it('wallet_fullOwnership_signData', async () => {
    const { request, factory } = createTestRpcServer();
    const fullOwnershipService = factory.get('fullOwnershipService');
    jest.spyOn(fullOwnershipService, 'signData').mockResolvedValue('signed');
    await expect(request('wallet_fullOwnership_signData', { data: '0x1234' } as any)).rejects.toThrow('Invalid params');
  });
});
