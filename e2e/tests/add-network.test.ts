import { DefaultTestEnv } from '../helpers';

DefaultTestEnv.setupTest({ initWalletWithDefaults: true });

describe('add network', function () {
  it('should work when the add name too long', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const tooLongName =
      'too too too too too long long long long long long long long long long long long long long long long long long long long long long long long';
    await page.getByLabel('Name').fill(tooLongName);
    await page.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(tooLongName).waitFor();
  });

  it('should work when the add name exist', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const existName = 'Testnet';
    await page.getByLabel('Name').fill(existName);
    await page.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(existName).allInnerTexts();
  });

  it('should work when the add url is not ckb rpc', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const randName = 'rand test name';
    await page.getByLabel('Name').fill(randName);
    await page.getByLabel('URL').fill('https://www.baidu.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(randName).allInnerTexts();
  });

  it('should work when the add url is ckb rpc', async () => {
    const page = await testEnv.context.newPage();
    const extensionId = testEnv.extensionId;
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByRole('button', { name: 'Network' }).click();
    await page.getByRole('button', { name: 'Add Network' }).click();

    const randName = 'rand name';
    await page.getByLabel('Name').fill(randName);
    await page.getByLabel('URL').fill('https://testnet.ckbapp.dev/');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByText(randName).allInnerTexts();
  });
});
