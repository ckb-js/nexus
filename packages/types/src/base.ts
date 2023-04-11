export type Promisable<T> = PromiseLike<T> | T;

export type Resolvable<T> = Promisable<T> | (() => Promisable<T>);

export type RequesterInfo = {
  url: string;
};
