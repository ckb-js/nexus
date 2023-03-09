import { formatMessage, resolveProvider } from '../src';

test('resolveProvider', async () => {
  const password = '123456';

  // sync provider
  expect(resolveProvider(password)).toBe(password);
  // async provider
  await expect(resolveProvider(() => Promise.resolve(password))).resolves.toBe(password);
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
