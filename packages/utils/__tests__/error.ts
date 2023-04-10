import { throwError, unimplemented } from '../src';

describe('errors', () => {
  test('plain message', () => {
    expect(() => throwError('plain message')).toThrow(/plain message/);
  });

  test('format error message', () => {
    expect(() => throwError('error string: %s', 'message')).toThrow(/error string: message/);
    expect(() => throwError('error buffer: %s', Buffer.from([0, 1, 2]))).toThrow(/error buffer: 0x000102/);
    expect(() => throwError('error number: %s', 1)).toThrow(/error number: 1/);
    expect(() => throwError('error object: %s', { key: 'value' })).toThrow(/error object: {"key":"value"}/);
  });
});

test('utils#error throw', () => {
  expect(() => throwError()).toThrow();
  expect(() => unimplemented()).toThrow(/Unimplemented/);
});
