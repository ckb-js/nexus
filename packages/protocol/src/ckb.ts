import type { ChainInfo } from '@ckb-lumos/base';

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
}
