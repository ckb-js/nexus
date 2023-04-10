import { assert } from '../src';

it('utils#asserts', () => {
  expect(() => assert(1 + 1 === 2)).not.toThrow();
  expect(() => assert(1 + 1 === 3)).toThrow();
});
