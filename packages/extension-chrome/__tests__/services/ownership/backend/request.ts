import fetchMock from 'jest-fetch-mock';
import { requestWithRetries } from '../../../../src/services/ownership/backend/request';

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
    await requestWithRetries(() => fetch('http://dummy'));
    expect(fetch).toBeCalledTimes(2);
  });
});
