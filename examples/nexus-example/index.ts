/* eslint-disable @typescript-eslint/no-unused-vars */
import { RPC } from '@ckb-lumos/lumos';
import { buildTxSkeleton, completeTx, signTx } from './txBuilder';

async function connectWallet() {
  return await window.ckb.request({ method: 'wallet_enable', params: [] });
}

if (!window.ckb) {
  alert('please install Nexus at first');
}

async function main() {
  await connectWallet();
  const txSkeleton = await buildTxSkeleton();
  let tx = await completeTx(txSkeleton);
  // uncomment next lines to call Nexus to sign Transaction
  // tx = await signTx(tx);

  console.log(tx);

  // uncomment next lines to send tx on the CKB chain
  // const rpc = new RPC("https://testnet.ckb.dev");
  // const txHash = await rpc.sendTransaction(tx);
  // console.log("txHash", txHash);
}

void main();
