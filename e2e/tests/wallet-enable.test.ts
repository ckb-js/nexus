import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

jest.setTimeout(20_000);
describe('Enable wallet', function () {
  test('should get the nickname when approved', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(testEnv.defaultE2eData.nickname);
  });

  test('should throw when user reject approval', async () => {
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Cancel' }).click();

    await expect(enableTask).rejects.toThrowError(/reject/);
  });
});
