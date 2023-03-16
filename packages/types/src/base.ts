export type Promisable<T> = PromiseLike<T> | T;

export type Bytes = string;

export type RequesterInfo = {
  url: string;
};

export type { Nickname, Cursor, Paginate, Signature } from '@nexus-wallet/protocol/lib/base';
