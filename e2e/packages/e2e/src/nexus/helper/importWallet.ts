import { WalletManagerPageTestIdInfo } from '../page/wallet-manager-page';
import { Page } from 'playwright';
import { getByTestId } from './util';

// click `import wallet`
export async function clickImportWallet(page: Page): Promise<void> {
  await page.locator(`[data-test-id="${WalletManagerPageTestIdInfo.ImportWallet}"]`).click();
}

// input `mnemonic`
export async function inputMnemonic(page: Page, mnemonic: string): Promise<void> {
  const mnemonicArr = mnemonic.split(' ');
  for (let i = 1; i <= mnemonicArr.length; i++) {
    await getByTestId(page, WalletManagerPageTestIdInfo.getSeedByIdx(i - 1)).type(mnemonicArr[i - 1]);
  }
}

// click confirm
export async function clickConfirm(page: Page): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.Next).click();
}
