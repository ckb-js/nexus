import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('Enable wallet', function () {
  it('should get the nickname when approved', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(testEnv.defaultE2eData.nickname);
  });

  it('should throw when user reject approval', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Cancel' }).click();

    await expect(enableTask).rejects.toThrowError(/reject/);
  });

  /**
   *  skip: Unable to open the plugin wallet on the current page to query the wallet's connection status
   * 1. request  wallet_enable
   * 2. approved
   * expected
   * 1. popup.html: connect status => connected
   */
  it.todo('should connected after approved');

  it('should warn when wallet_enable again', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });
    const notificationPage = await testEnv.getNotificationPage();
    try {
      //request wallet_enable again
      await ckb.request({ method: 'wallet_enable' });
    } catch (e) {
      expect(`${e}`).toMatch(/A request is still in pending./);

      await notificationPage.getByRole('button', { name: 'Connect' }).click();
      const res = await enableTask;
      expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);
      return;
    }
    expect('').toBe('failed');
  });

  /**
   * skip reason: Error: [webext-bridge] No handler registered in 'background' to accept messages with id 'rpc'
   *
   */
  it.skip('should not warn when 2 pages requested wallet', async () => {
    void ckb.request({ method: 'wallet_enable' });
    await testEnv.getNotificationPage();
    const page1 = await testEnv.context.newPage();
    await page1.goto(page.url());
    const ckbInPage1 = testEnv.getInjectedCkb(page1);
    await ckbInPage1.request({ method: 'wallet_enable' });
  });
});
