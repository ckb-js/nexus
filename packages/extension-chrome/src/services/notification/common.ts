import type { Call } from '@nexus-wallet/types';
import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import type { HexString, Script } from '@ckb-lumos/base';

export type SessionMethods = {
  session_getRequesterAppInfo: Call<void, { url: string }>;
  session_approveEnableWallet: Call<void, void>;

  /**
   * get a ready-to-sign transaction
   * the input/output scripts of the transaction should be highlighted if they are owned by the wallet
   */
  session_getUnsignedTransaction: Call<void, { tx: TransactionSkeletonObject; ownedLocks: Script[] }>;
  session_approveSignData: Call<{ password: string }, void>;

  /**
   * get bytes to be signed, the return data should detect if it can be converted to utf8 string,
   * if so, return the utf8 string, otherwise return the hex string
   */
  session_getUnsignedData: Call<void, { data: HexString; url: string }>;
  session_approveSignTransaction: Call<{ password: string }, void>;
};

export type NotificationPath = 'grant' | 'sign-data' | 'sign-transaction';

export const NotificationWindowSizeMap: Record<NotificationPath, { w: number; h: number }> = {
  grant: {
    w: 500,
    h: 600,
  },
  'sign-data': {
    w: 500,
    h: 722,
  },
  'sign-transaction': {
    w: 500,
    h: 722,
  },
};
