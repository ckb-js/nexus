import { setCommitHashToReport } from './util';

describe('get Env', function () {
  it('get nexus version', async () => {
    await setCommitHashToReport();
  });
});
