import { Page } from 'playwright';
import { WhitelistSitesPageTestIdInfo } from '../page/popup-page';
import { getByTestId } from './util';

export async function getUrlByIdx(page: Page, idx: number): Promise<string> {
  const path = await page.getByTestId(WhitelistSitesPageTestIdInfo.getUrlByIdx(idx));
  return await path.evaluate((e) => e.innerHTML);
}

export async function inputSearch(page: Page, search: string): Promise<void> {
  await getByTestId(page, WhitelistSitesPageTestIdInfo.WebsiteSearch).type(search);
}

export async function clickDeleteByIdx(page: Page, idx: number): Promise<void> {
  await getByTestId(page, WhitelistSitesPageTestIdInfo.getDeleteByIdx(idx)).click();
}

export async function getSiteSize(page: Page): Promise<void> {
  const local = await getByTestId(page, WhitelistSitesPageTestIdInfo.WebsiteList);
  console.log(local.allInnerTexts());
}
