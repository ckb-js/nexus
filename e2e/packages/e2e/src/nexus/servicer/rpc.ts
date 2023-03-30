import { Page } from 'playwright';
import { Cell } from '@ckb-lumos/base';

export interface WalletEnableResponse {
  nickname: string;
}

export async function wallet_enable(page: Page): Promise<WalletEnableResponse> {
  try {
    return await page.evaluate(() => {
      // @ts-ignore
      return window.ckb.request({ method: 'wallet_enable' });
    });
  } catch (e) {
    throw Error(`${e}`);
  }
}

//todo import @nexus-wallet/protocol
interface WalletFullOwnershipGetLiveCellsRequest {
  cursor?: string;
  change?: 'external' | 'internal';
}

export type WalletFullOwnershipGetLiveCellsResponse = {
  cursor: string;
  objects: Cell[];
};

export async function wallet_fullOwnership_getLiveCells(
  page: Page,
  request: WalletFullOwnershipGetLiveCellsRequest,
): Promise<WalletFullOwnershipGetLiveCellsResponse> {
  const obj = { request: request };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return window.ckb.request({
      method: 'wallet_fullOwnership_getLiveCells',
      params: obj.request,
    });
  }, obj);
}
