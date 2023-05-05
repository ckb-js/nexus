import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe(' remove whitelist site', function () {
  /**
   * skip reason: TODO: impl click remove btn
   */
  it.skip('should request failed after site remove', async () => {});

  /**
   * skip reason: Unable to open the plugin wallet on the current page to query the wallet's connection status
   */
  it.skip('should Disconnected when site remove', async () => {});

  /**
   * skip reason: TODO: impl click remove btn
   */
  it.skip('should pop connect page  when send wallet_enable again', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(testEnv.defaultE2eData.nickname);

    // TODO: remove url
  });
});
