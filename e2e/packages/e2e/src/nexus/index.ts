import { AddNetworkOpt, NexusWallet, PopupPageHelper, WalletManagerHelper } from '../types';
import { NexusUrl } from './const';

import { BrowserContext, Page } from 'playwright';

import { clickClipboardAndGet, clickCreateNewWallet, fullCheckSeeds } from './helper/createANewWallet';
import { clickConfirm, clickImportWallet, inputMnemonic } from './helper/importWallet';
import { Sleep } from './util/helper';
import {
  clickDone,
  clickGetStarted,
  clickNext,
  inputConfirmPassword,
  inputPassword,
  inputUserName,
} from './helper/walletManager';
import {
  checkPasswordIsHide,
  clickApprove,
  clickCancel,
  clickConnect,
  inputPassword as notionInputPassword,
} from './helper/notification';
import {
  clickAdd,
  clickAddNetwork,
  clickBack,
  clickNetwork,
  clickSiteRemoveByIdx,
  clickWhitelistSites,
  getConnectedStatus,
  getNetworkRadioGroup,
  getSiteList,
  getUserName,
  inputName,
  inputSiteSearch,
  inputUrl,
} from './helper/popup';

export const EXTENSION_URL_PRE = 'chrome-extension://';

export class PopupPageHelperImpl implements PopupPageHelper {
  extensionId: string;
  browser: BrowserContext;

  constructor(browser: BrowserContext, extensionId: string) {
    this.browser = browser;
    this.extensionId = extensionId;
  }

  getNewPage = (): Promise<Page> => getExtensionPageByUrl(this.browser, this.extensionId, NexusUrl.popup);

  async addNetwork(addNetworkOpt: AddNetworkOpt): Promise<void> {
    const page = await this.getNewPage();
    await clickNetwork(page);
    await clickAddNetwork(page);
    await inputName(page, addNetworkOpt.name);
    await inputUrl(page, addNetworkOpt.url);
    await clickAdd(page);
    // todo check
    await clickBack(page);
    await page.close();
  }

  async changeNetworkByName(name: string): Promise<void> {
    const page = await this.getNewPage();
    await clickNetwork(page);
    await page.getByText(name, { exact: true }).first().click();
    await clickBack(page);
    await page.close();
  }

  async queryNetworkList(): Promise<string[]> {
    const page = await this.getNewPage();
    await clickNetwork(page);
    const sites = await getNetworkRadioGroup(page);
    await page.close();
    return sites;
  }

  async queryWhitelist(): Promise<string[]> {
    const page = await this.getNewPage();
    await clickWhitelistSites(page);
    const sites = await getSiteList(page);
    await page.close();
    return sites;
  }

  async removeNetworkByName(name: string): Promise<void> {
    //todo
    // eslint-disable-next-line no-console
    console.log(`removeNetworkByName:${name}`);
    const page = await this.getNewPage();
    await clickNetwork(page);
    await page.getByText(name, { exact: true }).first().click();
    await page.close();
  }

  async removeWhitelistBySearch(search: string): Promise<void> {
    const page = await this.getNewPage();
    await clickWhitelistSites(page);
    await inputSiteSearch(page, search);
    const siteList = await getSiteList(page);
    if (siteList.length === 0) {
      await page.close();
      return;
    }
    await clickSiteRemoveByIdx(page, 0);
    await page.close();
  }

  async queryConnected(): Promise<boolean> {
    const page = await this.getNewPage();
    const ret = await getConnectedStatus(page);
    await page.close();
    return ret === 'Connected';
  }

  async queryNickName(): Promise<string> {
    const page = await this.getNewPage();
    const nickName = await getUserName(page);
    await page.close();
    return nickName;
  }
}

class WalletManagerHelperImpl implements WalletManagerHelper {
  extensionId: string;
  browser: BrowserContext;

  constructor(browser: BrowserContext, extensionId: string) {
    this.browser = browser;
    this.extensionId = extensionId;
  }

  createANewWallet = async (page: Page, userName: string, password: string): Promise<string> => {
    // click create a new wallet
    await clickCreateNewWallet(page);
    await clickGetStarted(page);
    await inputUserName(page, userName);
    await clickNext(page);
    await inputPassword(page, password);
    await inputConfirmPassword(page, password);
    await clickNext(page);
    // await clickAgreeTermsOfUse(page)
    // const seedArr =await getSeeds(page)
    const seedArr = (await clickClipboardAndGet(page)).split(' ');
    await clickNext(page);
    await fullCheckSeeds(page, seedArr);
    await clickConfirm(page);
    await clickDone(page);
    return seedArr.join(' ');
  };

  getNewPage = () => getExtensionPageByUrl(this.browser, this.extensionId, NexusUrl.walletManager);

  importWallet = async (page: Page, userName: string, mnemonic: string, password: string) => {
    await clickImportWallet(page);
    await inputMnemonic(page, mnemonic);
    await clickNext(page);
    await inputPassword(page, password);
    await inputConfirmPassword(page, password);
    await clickNext(page);
    await inputUserName(page, userName);
    await clickNext(page);
    await clickDone(page);
  };
}

export class Nexus implements NexusWallet {
  extensionId: string;
  browser: BrowserContext;
  popup: PopupPageHelper;
  walletManager: WalletManagerHelper;
  defaultTimeout = 1000;

  constructor(browser: BrowserContext, extensionId: string) {
    this.browser = browser;
    this.extensionId = extensionId;
    this.popup = new PopupPageHelperImpl(this.browser, this.extensionId);
    this.walletManager = new WalletManagerHelperImpl(this.browser, this.extensionId);
  }

  close = (): Promise<void> => close(this.browser, this.extensionId);
  getNotificationPage = (tryCount = 10): Promise<Page> =>
    getNotificationPage(this.browser, this.extensionId, NexusUrl.notification, tryCount);

  approve = async (passwd: string): Promise<void> => {
    const page = await this.getNotificationPage();
    if (!(await checkPasswordIsHide(page))) {
      await notionInputPassword(page, passwd);
    }
    await clickApprove(page);
    await page.close();
  };

  cancel = async (): Promise<void> => {
    const page = await this.getNotificationPage();
    await clickCancel(page);
  };

  connect = async (): Promise<void> => {
    try {
      const page = await this.getNotificationPage(5);
      await clickConnect(page);
      await page.close();
    } catch (e) {
      // todo check connected
      // eslint-disable-next-line no-console
      console.log('may be connected');
    }
  };
}

async function close(browser: BrowserContext, extensionId: string) {
  const pages = browser.pages().filter((page) => page.url().includes(extensionId));
  for (let i = 0; i < pages.length; i++) {
    await pages[i].close();
  }
}

export async function getNotificationPage(
  browser: BrowserContext,
  extensionId: string,
  includeStr: string,
  tryCount = 5,
): Promise<Page> {
  // wait extension page load
  // todo : add timeout
  for (let i = 0; i < tryCount; i++) {
    if (browser.pages().some((page) => page.url().includes(includeStr))) {
      const page: Page | undefined = browser.pages().find((page) => {
        return page.url().includes(extensionId) && page.url().includes(includeStr);
      });
      if (page !== undefined) {
        return page;
      }
    }
    await Sleep(1000);
  }
  throw new Error(`get Notification page time out:${tryCount}000ms`);
}

export async function getExtensionPageByUrl(browser: BrowserContext, extensionId: string, url: string): Promise<Page> {
  const page = await browser.newPage();
  await page.goto(`${EXTENSION_URL_PRE}${extensionId}/${url}`, {});
  return page;
}
