import { FullOwnershipProvider } from '../src';
import { TransactionSkeleton } from '@ckb-lumos/helpers';
import { createCell } from '@ckb-lumos/experiment-tx-assembler';
import { Cell, Script } from '@ckb-lumos/base';
import { BIish } from '@ckb-lumos/bi';
import produce from 'immer';

declare const recipient: Script;
declare const provider: FullOwnershipProvider;
const capacity: BIish = '10000000000'; // 100 CKB

async function transferCkb(): Promise<void> {
  // create an empty transaction skeleton
  let txSkeleton = TransactionSkeleton();

  // define the recipient cell
  const recipientCell = createCell({ capacity, lock: recipient });
  txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(recipientCell));

  txSkeleton = await provider.injectCapacity(txSkeleton, { amount: capacity });
  txSkeleton = await provider.payFee(txSkeleton);
  txSkeleton = await provider.signTransaction(txSkeleton);

  // TODO broadcast the transaction
  console.log(txSkeleton);
}

declare function isTargetNftCell(cell: Cell): boolean;

async function transferNft(): Promise<void> {
  let txSkeleton = TransactionSkeleton();

  // find the NFT cell in the Nexus wallet
  const myNft: Cell = await (async () => {
    for await (const cell of provider.collector()) {
      if (isTargetNftCell(cell)) {
        return cell;
      }
    }
    throw new Error('Cannot find the NFT cell');
  })();

  // create a new cell with the same data and capacity, but with a different lock script
  const recipientCell = produce(myNft, (draft) => {
    draft.cellOutput.lock = recipient;
  });

  txSkeleton.update('inputs', (inputs) => inputs.push(myNft));
  txSkeleton.update('outputs', (outputs) => outputs.push(recipientCell));
  txSkeleton = await provider.payFee(txSkeleton);
  txSkeleton = await provider.signTransaction(txSkeleton);

  // TODO broadcast the transaction
  console.log(txSkeleton);
}

// avoid eslint error
export { transferNft, transferCkb };
