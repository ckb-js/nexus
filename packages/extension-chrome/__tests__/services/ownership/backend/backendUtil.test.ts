import fetchMock from 'jest-fetch-mock';
import { createRpcClient } from '../../../../src/services/ownership/backend/backendUtils';

describe('refetch', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('should refetch when first request fails', async () => {
    fetchMock.mockRejectOnce(new Error('some error'));
    fetchMock.mockResponse(JSON.stringify({ result: 'some result' }));
    const { request } = createRpcClient('');
    await request('some_method', {});

    expect(fetch).toBeCalledTimes(2);
  });
});
