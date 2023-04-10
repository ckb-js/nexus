export type Promisable<T> = PromiseLike<T> | T;

export type Resolvable<T> = T | PromiseLike<T> | (() => T) | (() => PromiseLike<T>);

export type RequesterInfo = {
  url: string;
};
