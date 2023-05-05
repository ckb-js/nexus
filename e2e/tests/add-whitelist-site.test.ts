import { DefaultTestEnv } from '../helpers';
import { asyncSleep } from '@nexus-wallet/utils';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });
describe('add whitelist  site', function () {
  it('should request failed before add whitelist', async () => {
    try {
      await ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks' });
    } catch (error) {
      expect(`${error}`).toMatch(/not in the whitelist/);
      return;
    }
    expect('').toBe('failed');
  });

  /**
   * TODO: impl localhost  can be visited
   */
  it.todo('should work that add localhost url');
  /**
   * TODO: impl 192.168  can be visited
   */
  it.todo('should work that add 192.168.. url');

  it('Should wallet_enable work that add url protocol is HTTP', async () => {
    const httpUrl = 'http://info.cern.ch';
    await page.goto(httpUrl);
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);
  });

  it('Should wallet_enable work that add url protocol is HTTPS', async () => {
    const httpsUrl = 'https://github.com';
    await page.goto(httpsUrl);
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);
  });

  /**
   * skip reason :TODO: check url is in the box
   */
  it.skip('should work that add url is too long', async () => {
    const tooLongUrl = 'https://mememmememememmemememmememememmemememmememememme.bit.cc/';
    await page.goto(tooLongUrl);
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);
  });

  it('should request work after add whitelist ', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    await asyncSleep(1000);
    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    await ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params: {} });
  });

  it('should find url in whitelist after add whitelist', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await page.getByRole('button', { name: 'Whitelist Sites' }).click();
    // await page.getByRole('').fill(urlTransferDomainName(testEnv.defaultE2eData.localServerUrl))
    await page.getByText(urlTransferDomainName(testEnv.defaultE2eData.localServerUrl));
  });
});

export function urlTransferDomainName(url: string): string {
  const match = url.match(/^https?:\/\/([^/]+)/);
  return match ? match[1] : '';
}
