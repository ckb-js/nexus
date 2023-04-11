import { assert } from '../src';

describe('assert', () => {
  test('simple cases', () => {
    expect(() => assert(1 + 1 === 2)).not.toThrow();
    expect(() => assert(1 + 1 === 3)).toThrow();

    expect(() => assert(0)).toThrow();
    expect(() => assert('')).toThrow();
    expect(() => assert(undefined)).toThrow();
    expect(() => assert(null)).toThrow();

    expect(() => assert(1)).not.toThrow();
    expect(() => assert('1')).not.toThrow();
  });

  test('with custom message', () => {
    expect(() => assert(1 + 1 === 3, '1 + 1 should be 2, but got 3')).toThrow(
      /Assertion failed: 1 \+ 1 should be 2, but got 3/,
    );
    expect(() => assert(1 + 1 === 3, '1 + 1 should be %s, but got %s', 2, 3)).toThrow(
      /Assertion failed: 1 \+ 1 should be 2, but got 3/,
    );
  });
});
