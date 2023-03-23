/**
 * Omit the prefix of the keys of an object
 * @example
 * // should be { a: number, b: string, c: boolean }
 * type Omitted = OmitPrefix<{ p_a: number, p_b: string, c: boolean }, 'p_'>;
 */
export type OmitPrefix<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}${infer U}` ? U : K]: T[K];
};
