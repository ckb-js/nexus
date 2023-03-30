/* eslint-disable @typescript-eslint/no-unused-vars */
import { RPC } from '@ckb-lumos/lumos';
import { connectWallet, getAnAddress, buildTransferTxSkeleton, signTx, sendTx } from './lib';
import { InjectedCkb } from '@nexus-wallet/protocol/lib/injected';

declare global {
  interface Window {
    ckb: InjectedCkb;
  }
}

if (!window.ckb) {
  alert('please install Nexus at first');
}

// prettier-ignore
async function main() {
  /**
   *  Step 1: connect wallet
   *
   *  Firstly, you need to enable the Nexus Wallet by calling the `wallet_enable` RPC.
   *  If your dApp is the first time to connect to the wallet,
   *  you'll need to call `wallet_enable` API to enable the wallet for the dApp.
   *  After calling this method, we can see the dApp in the whitelist
   */
  // uncomment next line to connect Nexus
  // await connectWallet();

  /**
   *  Step 2: Get an address and receive some testnet CKB
   *
   *  You can get the off-chain locks by calling the `wallet_fullOwnership_getOffChainLocks` RPC.
   *
   *  Then you can use the address to receive some testnet CKB from the [CKB Faucet](https://faucet.nervos.org/)
   *
   *  After you have received the testnet CKB, the lock that used to receive the CKB will become an on-chain lock.
   */
  // uncomment next line to get an address
  // await getAnAddress();

  /**
   *  Step 3: Build a transfer transaction
   *
   *  Now that you have 10000 CKB, let's transfer 100 CKB to another address.
   *
   *  We can get the live cells by calling the `wallet_fullOwnership_getLiveCells` RPC.
   */
  // uncomment next line to build a transfer transaction
  // const txSkeleton = await buildTransferTxSkeleton();

  /**
   *  Step 4: Sign the transaction
   *
   *  After you have built the transactionSkeleton,
   *  you can sign the transaction by calling the `wallet_fullOwnership_signTransaction` RPC.
   *
   *  We can get the live cells by calling the `wallet_fullOwnership_getLiveCells` RPC.
   */
  // uncomment next line to sign the transaction
  // const tx = await signTx(txSkeleton);
  
  /**
   *  Step 5: Send the transaction on CKB testnet
   *
   *  After you have signed the transaction, you can send the transaction on the CKB testnet if you would like to.
   */
  // uncomment next lines to send tx on the CKB chain
  // await sendTx(tx);
}

void main();
