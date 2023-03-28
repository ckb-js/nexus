import { FullOwnership } from './ownership';
import { Wallet } from './wallet';

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
export interface RpcMethods extends Wallet, FullOwnership {}
