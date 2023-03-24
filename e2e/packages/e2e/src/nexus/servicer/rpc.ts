/* eslint-disable */
import { Page } from 'playwright';

export async function wallet_enable(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      // @ts-ignore
      window.ckb.request({ method: 'wallet_enable' });
    });
  } catch (e) {
    throw Error(`${e}`);
  }
}

interface WalletFullOwnershipGetLiveCellsRequest {
  cursor: string;
  change: 'external' | 'internal';
}

export async function wallet_fullOwnership_getLiveCells(
  page: Page,
  request: WalletFullOwnershipGetLiveCellsRequest,
): Promise<string> {
  const obj = { request: request };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return window.ckb.request({
      method: 'wallet_fullOwnership_getLiveCells',
      params: obj.request,
    });
  }, obj);
}
