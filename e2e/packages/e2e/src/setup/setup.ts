import { NexusSetUpOptions, NexusWallet } from '../types';
import { Nexus } from '../nexus';
import { BrowserContext } from 'playwright';

export async function setUpNexus(browser: BrowserContext, nexusSetUpOptions: NexusSetUpOptions): Promise<NexusWallet> {
  let nex: NexusWallet;
  nex = new Nexus(browser, await getExtensionId(browser));

  if (nexusSetUpOptions.mock === true) {
    return nex;
  }
  const managePage = await nex.walletManager.getNewPage();

  if (nexusSetUpOptions.seed !== undefined) {
    // create new account
    await nex.walletManager.importWallet(
      managePage,
      nexusSetUpOptions.userName,
      nexusSetUpOptions.seed,
      nexusSetUpOptions.passwd,
    );
    await managePage.close();
    return nex;
  }
  // load account by seed
  await nex.walletManager.createANewWallet(managePage, nexusSetUpOptions.userName, nexusSetUpOptions.passwd);
  await managePage.close();
  return nex;
}

export async function getExtensionId(browser: BrowserContext): Promise<string> {
  // get extension targe
  let [background] = browser.serviceWorkers();
  if (!background) background = await browser.waitForEvent('serviceworker');
  // from chrome-extension://ebabfojjjcgoninaddkcccjnpjngllkd/popup.html get ebabfojjjcgoninaddkcccjnpjngllkd
  return background.url().split('/')[2];
}
