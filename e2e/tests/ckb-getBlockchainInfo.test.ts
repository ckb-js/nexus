import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('ckb getBlockchain info', function () {
  it('should throw when the page not in whitelist', async () => {
    try {
      await ckb.request({ method: 'ckb_getBlockchainInfo' });
    } catch (e) {
      expect(`${e}`).toMatch(/is not in the whitelis/);
      return;
    }
    expect('').toBe('failed');
  });

  it('using switched network when network is changed', async () => {
    // add whitelist
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(testEnv.defaultE2eData.nickname);

    const changeNetBeforeResponse = await ckb.request({ method: 'ckb_getBlockchainInfo' });

    expect(changeNetBeforeResponse.chain).toBe('ckb_testnet');
    // change network
    const extensionIdPage = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await extensionIdPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await extensionIdPage.getByRole('button', { name: 'Network' }).click();
    await extensionIdPage.getByText('Mainnet').click();
    await extensionIdPage.close();

    const changeNetAfterResponse = await ckb.request({ method: 'ckb_getBlockchainInfo' });
    expect(changeNetAfterResponse.chain).toBe('ckb');
  });

  it('should throw when the current network is unavailable', async () => {
    // add whitelist
    const enableTask = ckb.request({ method: 'wallet_enable' });

    const notificationPage = await testEnv.getNotificationPage();
    await notificationPage.getByRole('button', { name: 'Connect' }).click();

    const res = await enableTask;
    expect(res.nickname).toBe(testEnv.defaultE2eData.nickname);

    // should not ask again when already approved
    const res2 = await ckb.request({ method: 'wallet_enable' });
    expect(res2.nickname).toBe(testEnv.defaultE2eData.nickname);

    const changeNetBeforeResponse = await ckb.request({ method: 'ckb_getBlockchainInfo' });

    expect(changeNetBeforeResponse.chain).toBe('ckb_testnet');

    const extensionIdPage = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await extensionIdPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await extensionIdPage.getByRole('button', { name: 'Network' }).click();

    // add user network that network is wrong
    await extensionIdPage.getByRole('button', { name: 'Add Network' }).click();
    const randName = 'rand name';
    await extensionIdPage.getByLabel('Name').fill(randName);
    await extensionIdPage.getByLabel('URL').fill('http://localhost:3000');
    await extensionIdPage.getByRole('button', { name: 'Add' }).click();
    await extensionIdPage.getByText(randName).allInnerTexts();

    // change network that  is wrong
    await extensionIdPage.getByText(randName).click();
    await extensionIdPage.close();

    try {
      await ckb.request({ method: 'ckb_getBlockchainInfo' });
    } catch (e) {
      return;
    }
    expect('').toBe('failed');
  });
});
