import { resolveProvider } from '../src';

test('resolveProvider', async () => {
  const password = '123456';

  // sync provider
  expect(resolveProvider(password)).toBe(password);
  // async provider
  await expect(resolveProvider(() => Promise.resolve(password))).resolves.toBe(password);
});
