import { NexusCommonErrors } from '../../src/errors';

describe('Nexus Error formatter', () => {
  it('should format reason when there is no suggestions', async () => {
    const errorWithOutSuggestions = NexusCommonErrors.ApproveRejected();
    expect(errorWithOutSuggestions.message).toEqual('The approval was rejected');
  });
  it('should format suggestions when there is some suggestions', async () => {
    const errorWithOutSuggestions = NexusCommonErrors.DuplicateRequest();
    expect(errorWithOutSuggestions.message).toEqual(
      'A request is still in pending, Please handle requests that are still pending first',
    );
  });
});
