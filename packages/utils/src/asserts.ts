import { throwError } from './error';

/**
 * Assert condition is truthy, otherwise throw error.
 * This function usually used with TypeScript's `asserts` type guard
 * @example
 *   assert(typeof value === 'string', 'value must be a string')
 *   assert(typeof value === 'string', 'value must be a string, got %s', typeof value)
 * @param condition
 * @param args
 */
export function assert(condition: unknown, ...args: unknown[]): asserts condition {
  if (!condition) throwError('Assertion failed', args);
}

/**
 * @deprecated use `assert` instead
 */
export function asserts(condition: unknown, ...args: unknown[]): asserts condition {
  assert(condition, ...args);
}
