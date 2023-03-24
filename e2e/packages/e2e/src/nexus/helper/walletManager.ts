// click Get start
import { Page } from 'playwright';
import { CreateANewWalletPageTextInfo, WalletManagerPageTestIdInfo } from '../page/wallet-manager-page';
import { getByTestId } from './util';

// click get start
export async function clickGetStarted(page: Page): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.GetStarted).click();
}

// input  name of user
export async function inputUserName(page: Page, name: string): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.UserName).type(name);
}

export async function clickBack(page: Page): Promise<void> {
  //todo change data test id
  await getByTestId(page, WalletManagerPageTestIdInfo.Back).click();
  // await page.getByText(CreateANewWalletPageTextInfo.back).click()
}

export async function clickNext(page: Page): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.Next).click();
}

// input pwd
export async function inputPassword(page: Page, passWord: string): Promise<void> {
  //     //todo change data-test-id
  // await getByTestId(page,ImportWalletPageTextInfo.password).type(password)
  await page.getByText(CreateANewWalletPageTextInfo.NewPassword).type(passWord);
  //
}

// confirm pwd
export async function inputConfirmPassword(page: Page, passWord: string): Promise<void> {
  await page.getByText(CreateANewWalletPageTextInfo.ConfirmPassword).type(passWord);

  // await getByTestId(page,WalletManagerPageTestIdInfo.ConfirmPassword).type(passWord)
}

// click agree Terms Of Use
export async function clickAgreeTermsOfUse(page: Page): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.AggreeTermsOfUse).click();
}

// click `all done`
export async function clickDone(page: Page): Promise<void> {
  await getByTestId(page, WalletManagerPageTestIdInfo.Done).click();
}
