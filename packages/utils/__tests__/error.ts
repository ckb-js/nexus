import { errors } from '../src';

describe('errors', () => {
  test('plain message', () => {
    expect(() => errors.throwError('plain message')).toThrow(/plain message/);
  });

  test('format error message', () => {
    expect(() => errors.throwError('error string: %s', 'message')).toThrow(/error string: message/);
    expect(() => errors.throwError('error buffer: %s', Buffer.from([0, 1, 2]))).toThrow(/error buffer: 0x000102/);
    expect(() => errors.throwError('error number: %s', 1)).toThrow(/error number: 1/);
    expect(() => errors.throwError('error object: %s', { key: 'value' })).toThrow(/error object: {"key":"value"}/);
  });
});

test('utils#error throw', () => {
  expect(() => errors.throwError()).toThrow();
  expect(() => errors.unimplemented()).toThrow(/Unimplemented/);
});
