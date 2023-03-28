export type Promisable<T> = PromiseLike<T> | T;

export type RequesterInfo = {
  url: string;
};
