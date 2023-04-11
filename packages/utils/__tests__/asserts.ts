import { assert } from '../src';

it('utils#asserts', () => {
  expect(() => assert(1 + 1 === 2)).not.toThrow();
  expect(() => assert(1 + 1 === 3)).toThrow();

  expect(() => assert(0)).toThrow();
  expect(() => assert('')).toThrow();
  expect(() => assert(undefined)).toThrow();
  expect(() => assert(null)).toThrow();

  expect(() => assert(1)).not.toThrow();
  expect(() => assert('1')).not.toThrow();
});
