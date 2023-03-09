import { Cell, Script } from '@ckb-lumos/lumos';
import { Config, NetworkConfig, TrustedHost } from '../services';
import {
  GetOffChainLocksPayload,
  GetOnChainLocksPayload,
  GetPaginateItemsPayload,
  GroupedSignature,
  SignDataPayload,
  SignTransactionPayload,
  Signature,
} from '../services/OwnershipService';
import { Paginate } from '../base';
/**
 * Exposed RPC methods for the wallet, the `debug_` prefix is for development purpose only,
 * and will be removed in the production version
 * @example
 * To communicate with the wallet, we use the `window.ckb.request` method.
 * The `window.ckb` object is injected by the wallet
 *
 * ```js
 * await window.ckb.request({ method: "wallet_enable" })
 * ```
 */
export interface RpcMethods {
  /**
   * If a dApp is the first time to connect to the wallet,
   * it needs to call this method to enable the wallet for the dApp.
   * After calling this method, we can see the dApp in the whitelist
   */
  wallet_enable(): Promise<void>;

  /**
   * get unused locks of which the wallet has full ownership
   * @example
   * ```js
   * await window.ckb.request({ method: 'wallet_fullOwnership_getOffChainLocks', params: { change: 'external' } });
   * ```
   * @param payload  the `change` field defaults to 'external'
   * @returns the off-chain locks of current wallet
   */
  wallet_fullOwnership_getOffChainLocks(payload: GetOffChainLocksPayload): Promise<Script[]>;

  /**
   * get used locks of which the wallet has full ownership
   * @example
   * ```js
   * await window.ckb.request({ method: 'wallet_fullOwnership_getOnChainLocks', params: { change: "internal", cursor: "0" } });
   * ```
   * @param payload  the `change` field defaults to `'external'`, if the `cursor` is blank, it is equivalent to `"0"` and will return the first page of on-chain locks
   * @returns on-chain locks of the current wallet with pagination info, the page size is 20
   */
  wallet_fullOwnership_getOnChainLocks(payload: GetOnChainLocksPayload): Promise<Paginate<Script>>;

  /**
   * get live cells of which the wallet has full ownership
   * @example
   * ```js
   * await window.ckb.request({ method: 'wallet_fullOwnership_getLiveCells', params: {cursor: "0:0x" }})
   * ```
   * @param payload  the `change` field defaults to 'external', if the `cursor` is blank, it is equivalent to `"0:0x"` and will return the first page of live cells
   * @returns live cells of current wallet with pagination info, the page size is 20
   */
  wallet_fullOwnership_getLiveCells(payload?: GetPaginateItemsPayload): Promise<Paginate<Cell>>;

  /**
   * sign a transaction with the wallet
   * @example
   * ```js
   * await window.ckb.request({ method: 'wallet_fullOwnership_signTransaction', params: { tx: <YOUR_TRANSACTION> }})
   * ```
   * @param payload  the `tx` is your transaction
   * @returns an array of [lock, signature] tuple
   */
  wallet_fullOwnership_signTransaction(payload: SignTransactionPayload): Promise<GroupedSignature>;

  /**
   * sign a transaction with the wallet
   * @example
   * ```js
   * await window.ckb.request({ method: 'wallet_fullOwnership_signData', params: { data: '0x1234', lock: <YOUR_LOCK> }})
   * ```
   * @param payload  `data` you would like to sign, `lock` indicates which lock you would like to use to sign the data
   * @returns the signature of the data if the wallet has full ownership of the lock passed in
   */
  wallet_fullOwnership_signData(payload: SignDataPayload): Promise<Signature>;

  /**
   * Get the wallet config
   */
  debug_getConfig(): Promise<Config>;
}

export type { Config, NetworkConfig, TrustedHost };
