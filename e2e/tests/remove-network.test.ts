import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('Remove network', function () {
  /**
   * skip reason: TODO: impl click remove network option
   */
  it.skip('should remove successful that network is not in use', async () => {
    // add network
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const addNetworkName = 'name';
    await page.getByLabel('Name').fill(addNetworkName);
    await page.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(addNetworkName).waitFor();

    // TODO:  add remove network option
  });

  /**
   * skip reason: TODO: impl click remove network option
   */
  it.skip('should remove successful that network is in use', async () => {
    // add network
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const addNetworkName = 'name';
    await page.getByLabel('Name').fill(addNetworkName);
    await page.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(addNetworkName).waitFor();

    // TODO:  add remove network option

    // network change main
  });
});
