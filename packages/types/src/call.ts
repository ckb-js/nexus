export type CallMap = Record<string, Call<unknown, unknown>>;
export type CallParam<T> = T extends Call<infer P, unknown> ? P : never;
export type CallResult<T> = T extends Call<unknown, infer R> ? R : never;

export interface Call<Param, Result> {
  params: Param;
  result: Result;
}

export interface AsyncCall<Param, Result> {
  params: Param;
  result: PromiseLike<Result>;
}
export type AsyncCallMap = Record<string, AsyncCall<unknown, unknown>>;
