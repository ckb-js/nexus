/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cell, BI, helpers, RPC } from '@ckb-lumos/lumos';
import { Transaction, commons } from '@ckb-lumos/lumos';
import { Script } from '@ckb-lumos/base';
import { config } from '@ckb-lumos/lumos';

export const connectWallet = async (): Promise<unknown> => {
  return await window.ckb.request({ method: 'wallet_enable', params: [] });
};

export const getAnAddress = async (): Promise<string> => {
  const offChainLocks = (await window.ckb.request({
    method: 'wallet_fullOwnership_getOffChainLocks',
    params: { change: 'external' },
  })) as Script[];
  const lock = offChainLocks[0];
  const address = helpers.encodeToAddress(lock);
  console.log('got an address:', address);
  return address;
};

export const buildTransferTxSkeleton = async (): Promise<helpers.TransactionSkeletonType> => {
  // use an external lock to receive the CKB
  const externalOffChainLocks = (await window.ckb.request({
    method: 'wallet_fullOwnership_getOffChainLocks',
    params: { change: 'external' },
  })) as Script[];
  const receiveLock = externalOffChainLocks[0];
  // use an external lock to receive the CKB change
  const internalOffChainLocks = (await window.ckb.request({
    method: 'wallet_fullOwnership_getOffChainLocks',
    params: { change: 'internal' },
  })) as Script[];
  const changeLock = internalOffChainLocks[0];
  // get the live cells to spend
  const getLiveCellsRes = await window.ckb.request({
    method: 'wallet_fullOwnership_getLiveCells',
    params: {},
  });
  // find some cell that has enough capacity(164 CKB)
  const liveCell: Cell = (getLiveCellsRes as any).objects.find((cell: Cell) =>
    BI.from(cell.cellOutput.capacity).gte(BI.from(165).mul(10 ** 8)),
  );
  const cellCapacity = BI.from(liveCell.cellOutput.capacity);
  console.log('CKBs collected:' + cellCapacity.div(10 ** 8).toString() + ' CKBs');
  let txSkeleton = helpers.TransactionSkeleton();
  // setup inputs
  config.initializeConfig(config.predefined.AGGRON4);
  txSkeleton = await commons.common.setupInputCell(txSkeleton, liveCell);
  // setup outputs
  txSkeleton = txSkeleton.update('outputs', (outputs) => {
    return outputs.clear().concat(
      // transfer 100 CKB to the receivelock
      {
        cellOutput: {
          capacity: BI.from(100)
            .mul(10 ** 8)
            .toHexString(),
          lock: receiveLock,
        },
        data: '0x',
      },
      // receive change CKB
      {
        cellOutput: {
          capacity: cellCapacity
            .sub(BI.from(100).mul(10 ** 8))
            .sub(1000) // 1000 shannons for tx fee
            .toHexString(),
          lock: changeLock,
        },
        data: '0x',
      },
    );
  });
  console.log('txSkeleton is:', txSkeleton.toJS());
  return txSkeleton;
};

export const signTx = async (rawTxSkeleton: helpers.TransactionSkeletonType): Promise<Transaction> => {
  const signatures = (await window.ckb.request({
    method: 'wallet_fullOwnership_signTransaction',
    params: { tx: helpers.createTransactionFromSkeleton(rawTxSkeleton) },
  })) as [Script, string][];
  let txSkeleton = commons.common.prepareSigningEntries(rawTxSkeleton);
  const tx = helpers.sealTransaction(
    txSkeleton,
    signatures.map(([_, sig]) => sig),
  );
  console.log('signed tx is:', tx);
  return tx;
};

export const sendTx = async (tx: Transaction): Promise<string> => {
  const rpc = new RPC('https://testnet.ckb.dev');
  const txHash = await rpc.sendTransaction(tx);
  console.log('txHash', txHash);
  return txHash;
};
