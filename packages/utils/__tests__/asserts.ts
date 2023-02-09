import { asserts } from '../src';

it('utils#asserts', () => {
  expect(() => asserts.nonFalsy(0)).toThrow();
  expect(() => asserts.nonFalsy('')).toThrow();
  expect(() => asserts.nonFalsy(undefined)).toThrow();
  expect(() => asserts.nonFalsy(null)).toThrow();

  expect(() => asserts.nonFalsy(1)).not.toThrow();

  expect(() => asserts.asserts(1 + 1 === 3)).toThrow();
});
