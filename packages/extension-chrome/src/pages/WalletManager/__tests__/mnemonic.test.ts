import { randomPickMnemonicPositions } from '../utils/mnemonic';
const actualRandom = jest.requireActual('lodash/random');

jest.mock('lodash/random', () => ({
  __esModule: true,
  default: jest.fn((...args: unknown[]) => actualRandom(...args)),
}));

it('utils#pick random position of an mnemonic', () => {
  const words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

  const positions = randomPickMnemonicPositions(words, 5);
  const anotherPositions = randomPickMnemonicPositions(words, 5);
  expect(positions.size).toBe(5);
  expect(Array.from(positions).every((position) => position >= 0 && position < words.length)).toBe(true);

  expect(Array.from(positions)).not.toEqual(Array.from(anotherPositions));

  const shortPositions = randomPickMnemonicPositions(words, 2);
  expect(shortPositions.size).toBe(2);
});

it('utils#pack random position should invoke lodash random function', () => {
  const mockRandom = jest.requireMock('lodash/random').default as jest.Mock;
  let callCount = 2;
  mockRandom.mockImplementation(() => callCount--);
  const words = ['a', 'b', 'c'];
  randomPickMnemonicPositions(words, 2);
  expect(mockRandom).toBeCalledWith(0, 2);
});
