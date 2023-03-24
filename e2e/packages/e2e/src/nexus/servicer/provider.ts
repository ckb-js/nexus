import { Page } from 'playwright';
import { HexString, Script, Transaction } from '@ckb-lumos/lumos';

export const PreloadJsContext = `const fullOwnership = "fullOwnership"
const ruleBasedOwnership = "ruleBasedOwnership"

ckbGetNetworkName = async (type) => {
    try {
        const ownership = await getOwnership(type)
        return await ownership.getNetworkName()
    } catch (e) {
        return e
    }

}

ownershipGetOffChainLocks = async (type, payload) => {
    try {
        const ownership = await getOwnership(type)
        return await ownership.getOffChainLocks(payload)
    } catch (e) {
        return e
    }
}
ownershipGetOnChainLocks = async (type, payload) => {
    try {

        const ownership = await getOwnership(type)
        return await ownership.getOnChainLocks(payload)
    } catch (e) {
        return e
    }
}

ownershipGetLiveCells = async (type, payload) => {
    try {
        const ownership = await getOwnership(type)
        return await ownership.getLiveCells(payload)
    } catch (e) {
        return e
    }
}
ownershipSignTransaction = async (type, tx) => {
    try {
        const ownership = await getOwnership(type)
        return await ownership.signTransaction(tx)
    } catch (e) {
        return e
    }
}

ownershipSignData = async (type, tx) => {
    try {
        const ownership = await getOwnership(type)
        return await ownership.signData(tx)
    } catch (e) {
        return e
    }
}
enableWallet = async () => {
    try {
        return await window.ckb.enable();
    } catch (e) {
        return e
    }
}

getWalletIsEnable = async () => {
    try {
        return await window.ckb.isEnabled();
    } catch (e) {
        return e
    }
}

getCkbVersion = () => {
    return window.ckb.version
}


getOwnership = async (type) => {
    const ckb = await enableWallet()
    if (type === "fullOwnership") {
        return ckb.fullOwnership
    }
    return ckb.ruleBasedOwnership
}
`;
type OwnerShipType = 'fullOwnership' | 'ruleBasedOwnership';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function ckbGetNetworkName(page: Page, ownerShipType: OwnerShipType): Promise<string> {
  const obj = { type: ownerShipType };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ckbGetNetworkName(obj.type);
  }, obj);
}

type BytesLike = HexString;
type PubkeyHash160 = BytesLike;
type LockLike = PubkeyHash160 | Script;

type SignDataPayload = {
  data: BytesLike;
  signer: LockLike;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Network = 'ckb' | 'ckb_testnet';

export interface GetPaginateItemsPayload {
  cursor?: string;
}

export interface OwnershipFilter {
  change?: 'external' | 'internal';
}

export interface GetLiveCellsPayload extends OwnershipFilter, GetPaginateItemsPayload {}

export interface GetOnChainLocksPayload extends OwnershipFilter, GetPaginateItemsPayload {}

export interface GetOffChainLocksPayload extends OwnershipFilter {
  // change?: boolean;
}

export async function ownershipSignData(
  page: Page,
  ownerShipType: OwnerShipType,
  signDataPayload: SignDataPayload,
): Promise<string> {
  const obj = { type: ownerShipType, signData: signDataPayload };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ownershipSignData(obj.type, obj.signData);
  }, obj);
}

export async function enableWallet(page: Page): Promise<unknown> {
  return await page.evaluate(() => {
    // @ts-ignore
    return enableWallet();
  });
}

export async function getWalletIsEnable(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    // @ts-ignore
    return getWalletIsEnable();
  });
}

export async function getCkbVersion(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // @ts-ignore
    return getCkbVersion();
  });
}

//todo
export async function ownershipGetOffChainLocks(
  page: Page,
  ownerShipType: OwnerShipType,
  payload: GetOffChainLocksPayload,
): Promise<unknown> {
  const obj = { type: ownerShipType, payload: payload };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ownershipGetOffChainLocks(obj.type, obj.payload);
  }, obj);
}

export async function ownershipGetOnChainLocks(
  page: Page,
  ownerShipType: OwnerShipType,
  payload: GetOnChainLocksPayload,
): Promise<unknown> {
  const obj = { type: ownerShipType, payload: payload };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ownershipGetOnChainLocks(obj.type, obj.payload);
  }, obj);
}

export async function ownershipGetLiveCells(
  page: Page,
  ownerShipType: OwnerShipType,
  payload?: GetLiveCellsPayload,
): Promise<unknown> {
  const obj = { type: ownerShipType, payload: payload };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ownershipGetLiveCells(obj.type, obj.payload);
  }, obj);
}

export async function ownershipSignTransaction(
  page: Page,
  ownerShipType: OwnerShipType,
  payload: { transaction: Transaction },
): Promise<unknown> {
  const obj = { type: ownerShipType, payload: payload };
  return await page.evaluate((obj) => {
    // @ts-ignore
    return ownershipSignTransaction(obj.type, obj.payload);
  }, obj);
}
