import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: false });

describe('Create a wallet', function () {
  it('clipboard matches the text in the box', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);
    await page.getByRole('button', { name: 'Create a Wallet' }).click();
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByLabel('A Descriptive Name For Your Wallet').fill(testEnv.defaultE2eData.nickname);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill(testEnv.defaultE2eData.password);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Copy to clipboard').click();
    const clipboard = await page.evaluate<string>('navigator.clipboard.readText()');
    await page.getByText(clipboard).waitFor();
  });

  it('should warn when the seed order is wrong', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);
    await page.getByRole('button', { name: 'Create a Wallet' }).click();
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByLabel('A Descriptive Name For Your Wallet').fill(testEnv.defaultE2eData.nickname);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill(testEnv.defaultE2eData.password);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Copy to clipboard').click();
    const clipboard = await page.evaluate<string>('navigator.clipboard.readText()');
    await page.getByRole('button', { name: 'Next' }).click();
    let seedArr = clipboard.split(' ');
    seedArr = seedArr.sort();
    for (let i = 0; i < seedArr.length; i++) {
      await page.getByText(seedArr[i]).click();
    }
    await page.getByRole('button', { name: 'Confirm' }).isDisabled();
  });
  it('should work when the seed order is right', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);
    await page.getByRole('button', { name: 'Create a Wallet' }).click();
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByLabel('A Descriptive Name For Your Wallet').fill(testEnv.defaultE2eData.nickname);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill(testEnv.defaultE2eData.password);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Copy to clipboard').click();
    const clipboard = await page.evaluate<string>('navigator.clipboard.readText()');
    await page.getByRole('button', { name: 'Next' }).click();
    let seedArr = clipboard.split(' ');
    for (let i = 0; i < seedArr.length; i++) {
      await page.getByText(seedArr[i]).click();
    }
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'All Done' }).click();
  });
});
