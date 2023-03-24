import { Page } from 'playwright';
import { getByTestId } from './util';
import {
  HomePageTestIdInfo,
  NetworksPageTestIdInfo,
  NetworksPageTextInfo,
  WhitelistSitesPageTestIdInfo,
} from '../page/popup-page';

export async function getUserName(page: Page): Promise<string> {
  return await getByTestId(page, HomePageTestIdInfo.UserName).innerText();
}

export async function getConnectedStatus(page: Page, expectedStatus = ''): Promise<string> {
  if (expectedStatus !== '') {
    await page.getByText(expectedStatus, { exact: true }).innerText();
  }
  return (await getByTestId(page, HomePageTestIdInfo.ConnectedStatus).innerText()).split('\n')[1];
}

export async function clickWhitelistSites(page: Page): Promise<void> {
  await getByTestId(page, HomePageTestIdInfo.WhitelistSites).click();
}

export async function clickNetwork(page: Page): Promise<void> {
  await getByTestId(page, HomePageTestIdInfo.Network).click();
}

//Whitelist Sites
export async function inputSiteSearch(page: Page, search: string): Promise<void> {
  await getByTestId(page, WhitelistSitesPageTestIdInfo.WebsiteSearch).type(search);
}

export async function clickSiteRemoveByIdx(page: Page, removeIdx: number): Promise<void> {
  await getByTestId(page, WhitelistSitesPageTestIdInfo.getDeleteByIdx(removeIdx)).click();
}

export function urlTransferDomainName(url: string): string {
  const match = url.match(/^https?:\/\/([^/]+)/);
  return match ? match[1] : '';
}

export async function getSiteList(page: Page, expectedList: string[] = []): Promise<string[]> {
  //todo check page load succ
  // await waitForTestId(page,WhitelistSitesPageTestIdInfo.WebsiteList)
  if (expectedList.length !== 0) {
    const domainNames = expectedList.map((url) => {
      return urlTransferDomainName(url);
    });
    for (let i = 0; i < domainNames.length; i++) {
      await page.getByText(domainNames[i]).allInnerTexts();
    }
  }
  return (await getByTestId(page, WhitelistSitesPageTestIdInfo.WebsiteList).innerText())
    .split('\n')
    .filter((x) => x !== '');
}

export async function clickBack(page: Page): Promise<void> {
  return await getByTestId(page, WhitelistSitesPageTestIdInfo.Back).click();
}

// network
export async function getNetworkRadioGroup(page: Page): Promise<string[]> {
  return (await getByTestId(page, NetworksPageTestIdInfo.NetworkRadioGroup).allInnerTexts())[0].split('\n');
}

export async function clickNetworkRadioByIdx(page: Page, idx: number): Promise<void> {
  await getByTestId(page, NetworksPageTestIdInfo.getNetworkRadioByIdx(idx)).click();
}

export async function clickAddNetwork(page: Page): Promise<void> {
  return await getByTestId(page, NetworksPageTestIdInfo.AddNetwork).click();
}

export async function inputName(page: Page, name: string): Promise<void> {
  await page.getByText(NetworksPageTextInfo.Name).type(name);
}

export async function inputUrl(page: Page, url: string): Promise<void> {
  await page.getByText(NetworksPageTextInfo.Url).type(url);
}

export async function clickAdd(page: Page): Promise<void> {
  await getByTestId(page, NetworksPageTestIdInfo.Add).click();
}
