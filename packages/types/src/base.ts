export type Promisable<T> = PromiseLike<T> | T;

export interface Paginate<T> {
  cursor: Cursor;
  objects: T[];
}

/**
 * cursor for paginate
 */
export type Cursor = string;

/**
 *
 */
export type Bytes = string;

export type RequesterInfo = {
  url: string;
};
