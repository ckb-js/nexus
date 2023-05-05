import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('Show wallet details', function () {
  it('should show nick name for wallet', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByText(testEnv.defaultE2eData.nickname).waitFor();
  });

  it('should show disconnected for the wallet', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByText('Disconnected').waitFor();
  });
  it('should show whitelist sites for the wallet', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Whitelist Sites' }).click();
    await page.getByText('No whitelist sites found.').waitFor();
  });
  it('should show networks list for the wallet', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByText('Mainnet').waitFor();
    await page.getByText('Testnet').waitFor();
  });

  it('should show feedback for the wallet', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('link', { name: 'Feedback' }).click();
    await page.waitForTimeout(1000);
    expect(testEnv.context.pages().some((page) => page.url().includes('ckb-js/nexus/issues'))).toBe(true);
  });
});
