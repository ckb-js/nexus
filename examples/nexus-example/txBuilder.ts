/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cell, BI, helpers } from '@ckb-lumos/lumos';
import { Transaction, Indexer, config } from '@ckb-lumos/lumos';
import { blockchain, Script } from '@ckb-lumos/base';
import { bytes } from '@ckb-lumos/codec';

export const buildTxSkeleton = async (): Promise<helpers.TransactionSkeletonType> => {
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
  const liveCells: Cell[] = (getLiveCellsRes as any).objects;
  const totalCapacity = liveCells.reduce((acc, cell) => acc.add(cell.cellOutput.capacity), BI.from(0));
  let txSkeleton = helpers.TransactionSkeleton();
  // setup inputs
  txSkeleton = txSkeleton.update('inputs', (inputs) => {
    return inputs.concat(...liveCells);
  });
  // setup outputs
  txSkeleton = txSkeleton.update('outputs', (outputs) => {
    return outputs.concat(
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
          capacity: totalCapacity
            .sub(BI.from(100).mul(10 ** 8))
            .sub(1000) // 1000 shannons for tx fee
            .toHexString(),
          lock: changeLock,
        },
        data: '0x',
      },
    );
  });

  return txSkeleton;
};

/**
 *   To build the transaction, there are still some other things to do
 *   Like fill in cellDeps, placeholder witnesses, etc.
 */
export const completeTx = async (txSkeleton: helpers.TransactionSkeletonType): Promise<Transaction> => {
  // fill cell provider, this is required when later all `createTransactionFromSkeleton`
  txSkeleton = txSkeleton.set('cellProvider', new Indexer('https://testnet.ckb.dev'));

  // fill in cellDeps
  txSkeleton = txSkeleton.update('cellDeps', (cellDeps) => {
    return cellDeps.concat({
      outPoint: {
        txHash: config.predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
        index: config.predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160.INDEX,
      },
      depType: config.predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160.DEP_TYPE,
    });
  });

  // fill in placeholer witnesses
  const inputLength = txSkeleton.get('inputs').size;
  const secp256k1Witness = bytes.hexify(
    blockchain.WitnessArgs.pack({
      lock: bytes.hexify(new Uint8Array(65)),
    }),
  );
  for (let i = 0; i < inputLength; i++) {
    txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(i, secp256k1Witness));
  }

  const tx = helpers.createTransactionFromSkeleton(txSkeleton);
  return tx;
};

export const signTx = async (tx: Transaction): Promise<Transaction> => {
  const signatures = (await window.ckb.request({
    method: 'wallet_fullOwnership_signTransaction',
    params: { tx },
  })) as [Script, string][];
  for (let index = 0; index < signatures.length; index++) {
    const sig = signatures[index][1];
    const newWitness = bytes.hexify(
      blockchain.WitnessArgs.pack({
        lock: sig,
      }),
    );
    tx.witnesses[index] = newWitness;
  }
  return tx;
};
