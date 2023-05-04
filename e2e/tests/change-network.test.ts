import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('Change network', function () {
  it('should get networkChanged when network change', async () => {
    await page.evaluate(() => {
      window.ckbNetworkName = '';
      window.ckb.on('networkChanged', (networkName: string) => {
        window.ckbNetworkName = networkName;
      });
    });
    const extensionIdPage = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await extensionIdPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await extensionIdPage.getByRole('button', { name: 'Network' }).click();
    await extensionIdPage.getByText('Mainnet').click();
    let ckbNetworkName = await page.evaluate(() => {
      return window.ckbNetworkName;
    });
    expect(ckbNetworkName).toBe('ckb');
    await extensionIdPage.getByText('Testnet').click();
    ckbNetworkName = await page.evaluate(() => {
      return window.ckbNetworkName;
    });
    expect(ckbNetworkName).toBe('ckb_testnet');
  });
  it('should get ckb name that change network is user added', async () => {
    const extensionIdPage = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await extensionIdPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await extensionIdPage.getByRole('button', { name: 'Network' }).click();
    await extensionIdPage.getByRole('button', { name: 'Add Network' }).click();

    const randName = 'user test net name';
    await extensionIdPage.getByLabel('Name').fill(randName);
    await extensionIdPage.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await extensionIdPage.getByRole('button', { name: 'Add' }).click();
    await extensionIdPage.getByText(randName).allInnerTexts();

    await extensionIdPage.getByRole('button', { name: 'Add Network' }).click();
    const notCkbName = 'user add not ckb test net name';
    await extensionIdPage.getByLabel('Name').fill(notCkbName);
    await extensionIdPage.getByLabel('URL').fill('https://github.com');
    await extensionIdPage.getByRole('button', { name: 'Add' }).click();
    await extensionIdPage.getByText(notCkbName).allInnerTexts();
    await page.evaluate(() => {
      window.ckbNetworkName = '';
      window.ckb.on('networkChanged', (networkName: string) => {
        window.ckbNetworkName = networkName;
      });
    });
    await extensionIdPage.getByText(randName).click();
    let ckbNetworkName = await page.evaluate(() => {
      return window.ckbNetworkName;
    });
    expect(ckbNetworkName).toBe(randName);

    await extensionIdPage.getByText(notCkbName).click();

    ckbNetworkName = await page.evaluate(() => {
      return window.ckbNetworkName;
    });

    expect(ckbNetworkName).toBe(notCkbName);
  });
});
