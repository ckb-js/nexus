import { NotificationPageTextInfo, SignMessagePageTestIdInfo } from '../page/notification-page';
import { Page } from 'playwright';
import { getByTestId } from './util';
import { BI, helpers, RPC } from '@ckb-lumos/lumos';
import { Output } from '@ckb-lumos/base/lib/api';

export async function clickApprove(page: Page): Promise<void> {
  await page.getByRole('button', { name: NotificationPageTextInfo.Approve }).click();
}

export async function inputPassword(page: Page, password: string): Promise<void> {
  await getByTestId(page, SignMessagePageTestIdInfo.Password).type(password);
}

export async function checkPasswordIsHide(page: Page): Promise<boolean> {
  return await getByTestId(page, SignMessagePageTestIdInfo.Password).isHidden();
}

export async function clickConnect(page: Page): Promise<void> {
  await page.getByRole('button', { name: NotificationPageTextInfo.Connect }).click();
}

export async function clickCancel(page: Page): Promise<void> {
  await page.getByRole('button', { name: NotificationPageTextInfo.Cancel }).click();
}

// sign transaction
export async function getTransactionInputs(page: Page): Promise<string[]> {
  await page.waitForSelector(`[data-test-id="${SignMessagePageTestIdInfo.getTransactionInputAddressByIdx(0)}"]`);
  return await getByTestId(page, SignMessagePageTestIdInfo.TransactionInputs).allInnerTexts();
}

export async function getTransactionOutputs(page: Page): Promise<string[]> {
  //            page.wait_for_selector("div[data-grid-item=true]")
  await page.waitForSelector(`[data-test-id="${SignMessagePageTestIdInfo.getTransactionOutputAddressByIdx(0)}"]`);
  return await getByTestId(page, SignMessagePageTestIdInfo.TransactionOutputs).allInnerTexts();
}

// export async function getTransdaa(page:Page):Promise<string[]>{
//
//
// }

interface Cell {
  address: string;
  type: string;
  capacity: string;
}

export interface WalletSendTxMsg {
  inputCells: Cell[];
  outputCells: Cell[];
}

export async function getSendTransactionMsg(page: Page): Promise<WalletSendTxMsg> {
  // get input
  const inputs = await getByTestId(page, SignMessagePageTestIdInfo.TransactionInputs).innerText();

  let inputCells = [];
  const matchResult = inputs.match(/\#/g);
  if (matchResult === null) {
    throw Error('inputs match result :null');
  }
  for (let i = 0; i < matchResult.length; i++) {
    inputCells.push({
      address: (
        await getByTestId(page, SignMessagePageTestIdInfo.getTransactionInputAddressByIdx(i)).innerText()
      ).split('\n')[1],
      type: await getByTestId(page, SignMessagePageTestIdInfo.getTransactionInputTypeByIdx(i)).innerText(),
      capacity: (
        await getByTestId(page, SignMessagePageTestIdInfo.getTransactionInputCapacityByIdx(i)).innerText()
      ).replace(' CKB', ''),
    });
  }
  // get output
  const outputs = await getByTestId(page, SignMessagePageTestIdInfo.TransactionOutputs).innerText();
  let outputCells = [];
  const outputsMatchResult = outputs.match(/\#/g);
  if (outputsMatchResult === null) {
    throw Error('outputsMatchResult result :null');
  }
  for (let i = 0; i < outputsMatchResult.length; i++) {
    outputCells.push({
      address: (
        await getByTestId(page, SignMessagePageTestIdInfo.getTransactionOutputAddressByIdx(i)).innerText()
      ).split('\n')[1],
      type: await getByTestId(page, SignMessagePageTestIdInfo.getTransactionOutputTypeByIdx(i)).innerText(),
      capacity: (
        await getByTestId(page, SignMessagePageTestIdInfo.getTransactionOutputCapacityByIdx(i)).innerText()
      ).replace(' CKB', ''),
    });
  }
  return {
    inputCells: inputCells,
    outputCells: outputCells,
  };
}

// export async function

async function getCellByHashAndIdx(rpc1: string, txHash: string, index: string): Promise<Output> {
  const client = new RPC(rpc1);
  const txStatus = await client.getTransaction(txHash);
  return {
    capacity: txStatus.transaction.outputs[BI.from(index).toNumber()].capacity,
    lock: txStatus.transaction.outputs[BI.from(index).toNumber()].lock,
  };
}

export async function transactionToWalletSendTxMsg(rpc: string, tx: unknown): Promise<WalletSendTxMsg> {
  // input cell
  let inputCells = [];
  // @ts-ignore
  for (let i = 0; i < tx.inputs.length; i++) {
    // @ts-ignore
    const input = tx.inputs[i];
    inputCells.push({
      address: helpers.encodeToAddress(
        (await getCellByHashAndIdx(rpc, input.previousOutput.txHash, input.previousOutput.index)).lock,
      ),
      type: '-',
      capacity: BI.from(
        (await getCellByHashAndIdx(rpc, input.previousOutput.txHash, input.previousOutput.index)).capacity,
      )
        .toNumber()
        .toString(),
    });
  }
  return {
    inputCells: inputCells,
    // @ts-ignore
    outputCells: tx.outputs.map((output) => {
      return {
        address: helpers.encodeToAddress(output.lock),
        type: '-',
        capacity: BI.from(output.capacity).toNumber().toString(),
      };
    }),
  };
}
