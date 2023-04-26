import type { ChainInfo, Transaction } from '@ckb-lumos/base';
import { OutputValidator } from './base';

export interface CkbMethods {
  /**
   * get the current chain info, useful when the app needs to determine what network Nexus is connected to.
   * @example
   *   await window.ckb.request({ method: "ckb_getBlockchainInfo" })
   * @returns {@link https://github.com/nervosnetwork/ckb/blob/develop/rpc/README.md#method-get_blockchain_info ChainInfo}
   * <details>
   * <summary>show return data example</summary>
   *
   * ```json
   * {
   *   "alerts": [
   *     {
   *       "id": "0x2a",
   *       "message": "An example alert message!",
   *       "notice_until": "0x24bcca57c00",
   *       "priority": "0x1"
   *     }
   *   ],
   *   "chain": "ckb",
   *   "difficulty": "0x1f4003",
   *   "epoch": "0x7080018000001",
   *   "isInitialBlockDownload": true,
   *   "medianime": "0x5cd2b105"
   * }
   * ```
   *
   * </details>
   */
  ckb_getBlockchainInfo(): Promise<ChainInfo>;

  /**
   * Send a transaction to current network
   * It's a proxy method of {@link https://github.com/nervosnetwork/ckb/blob/master/rpc/README.md#method-send_transaction | CKB send_transaction}
   * Currently it is **not** support to send transaction to a light client node.
   * @returns transaction hash of the sent transaction
   * @throws when the transaction is invalid, or meets network issue
   * @example
   * ```ts
   * const signedTransaction;// signed transaction with your business logic
   * const txHash = await window.ckb.request({ method: "ckb_sendTransaction", params: { tx: signedTransaction } });
   * // if your transaction is to mainnet or testnet, you can view it on https://explorer.nervos.org/transaction/${txHash}
   * ```
   */
  ckb_sendTransaction(payload: { tx: Transaction; outputsValidator?: OutputValidator }): Promise<string>;
}
