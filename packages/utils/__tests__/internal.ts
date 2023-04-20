import { formatMessage, resolveValue } from '../src';

test('resolveValue', async () => {
  const value = '123456';

  await expect(resolveValue(value)).resolves.toBe(value);
  await expect(resolveValue(() => value)).resolves.toBe(value);
  await expect(resolveValue(Promise.resolve(value))).resolves.toBe(value);
  await expect(resolveValue(() => Promise.resolve(value))).resolves.toBe(value);
});

describe('formatMessage', () => {
  it('should format message a readable string', () => {
    expect(formatMessage('string: %s', 'message')).toBe(`string: message`);
    expect(formatMessage('buffer: %s', Buffer.from([0, 1, 2]))).toBe(`buffer: 0x000102`);
    expect(formatMessage('number: %s', 1)).toBe(`number: 1`);
    expect(formatMessage('object: %s', { key: 'value' })).toBe(`object: {"key":"value"}`);
    expect(formatMessage('empty array: %s', [])).toBe(`empty array: []`);
  });

  it('should append extra arguments to the end of the message', () => {
    expect(formatMessage('string: %s', 'message', 'extra')).toBe(`string: message extra`);
    expect(formatMessage('extra buffer', Buffer.from([0, 0, 0]))).toBe('extra buffer 0x000000');
  });

  it('should format error', () => {
    expect(formatMessage(new Error('error message'))).toMatch(/error message/);
  });
});
