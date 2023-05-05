import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: false });

describe('Import a wallet', () => {
  it('should warn when input incorrect BIP39 words', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = '1 2 3 4 5 6 7 8 9 10 11 12'.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByText('Please  check your Seed').waitFor();
    await page.getByRole('button', { name: 'Next' }).isDisabled();
  });

  it('should works with paste 12 mnemonic', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = testEnv.defaultE2eData.mnemonic.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByRole('button', { name: 'Next' }).click();
  });

  it('should show error message when the input password is too short', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = testEnv.defaultE2eData.mnemonic.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('New password').fill('123456');
    await page.getByLabel('Confirm password').fill('123456');

    await page.getByText('Password must be ≥ 8 characters').waitFor();
    await page.getByRole('button', { name: 'Next' }).isDisabled();
  });

  it('should show error message when the confirm password is do not match', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = testEnv.defaultE2eData.mnemonic.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill('123456890');

    await page.getByText('Passwords do not match').waitFor();
    await page.getByRole('button', { name: 'Next' }).isDisabled();
  });

  it('should show error text when the nick name is too long', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = testEnv.defaultE2eData.mnemonic.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill(testEnv.defaultE2eData.password);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('A Descriptive Name For Your Wallet').fill('12345678901234567890');

    await page.getByText('Username must be ≤ 12 characters').waitFor();
    await page.getByRole('button', { name: 'Next' }).isDisabled();
  });

  it('should works with defaultE2eData', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/walletManager.html`);

    await page.getByRole('button', { name: 'Import a wallet' }).click();
    const wordsArr = testEnv.defaultE2eData.mnemonic.split(' ');
    for (let i = 0; i < wordsArr.length; i++) {
      await page.getByLabel(`${i + 1}`, { exact: true }).fill(wordsArr[i]);
    }
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('New password').fill(testEnv.defaultE2eData.password);
    await page.getByLabel('Confirm password').fill(testEnv.defaultE2eData.password);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('A Descriptive Name For Your Wallet').fill(testEnv.defaultE2eData.nickname);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'All Done' }).click();
  });
});
