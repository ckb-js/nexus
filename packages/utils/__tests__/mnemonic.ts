import { mnemonic } from '../';

it('utils#pick random position of an mnemonic', () => {
  const words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

  const positions = mnemonic.randomPickMnemonicPositions(words, 5);
  const anotherPositions = mnemonic.randomPickMnemonicPositions(words, 5);
  expect(positions.size).toBe(5);
  expect(Array.from(positions).every((position) => position >= 0 && position < words.length)).toBe(true);

  expect(Array.from(positions)).not.toEqual(Array.from(anotherPositions));
});
