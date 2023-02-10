import { formatMessage, resolveProvider } from '../src';

test('resolveProvider', async () => {
  const password = '123456';

  // sync provider
  expect(resolveProvider(password)).toBe(password);
  // async provider
  await expect(resolveProvider(() => Promise.resolve(password))).resolves.toBe(password);
});

test('formatMessage', () => {
  expect(formatMessage('string: %s', 'message')).toBe(`string: message`);
  expect(formatMessage('buffer: %s', Buffer.from([0, 1, 2]))).toBe(`buffer: 0x000102`);
  expect(formatMessage('number: %s', 1)).toBe(`number: 1`);
  expect(formatMessage('object: %s', { key: 'value' })).toBe(`object: {"key":"value"}`);
});
