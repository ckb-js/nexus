import { DefaultTestEnv } from '../helpers';

jest.setTimeout(40 * 1000);

describe('Enable wallet', function () {
  let env: DefaultTestEnv;

  beforeEach(async () => {
    env = new DefaultTestEnv({ initWalletWithDefaults: true });
    await env.init();
  });

  afterEach(async () => {
    await env.dispose();
  });

  test('should get the nickname when approved', async () => {
    const page = await env.context.newPage();
    await page.goto(env.defaultE2eData.localServerUrl);

    const ckb = await env.getInjectedCkb();

    const enableTask = ckb.request({ method: 'wallet_enable' });

    await env.approveForEnable();

    const res = await enableTask;
    expect(res.nickname).toBe(env.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(env.defaultE2eData.nickname);
  });

  test('should throw when user reject approval', async () => {
    const page = await env.context.newPage();
    await page.goto(env.defaultE2eData.localServerUrl);

    const ckb = await env.getInjectedCkb();

    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await env.getNotificationPage();
    await notificationPage.getByRole('button', { name: /cancel/i }).click();

    await expect(enableTask).rejects.toThrowError(/reject/);
  });
});
