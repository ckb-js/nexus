import { errors } from '../src';

it('utils#error throw', () => {
  expect(() => errors.throwError()).toThrow();
  expect(() => errors.unimplemented()).toThrow(/Unimplemented/);
});
