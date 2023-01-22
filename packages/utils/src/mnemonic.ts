import random from 'lodash/random';

export const randomPickMnemonicPositions = (mnemonic: string[], length: number): Set<number> => {
  const indexes = new Set<number>();

  while (indexes.size < length - 1) {
    const newIndex = random(0, mnemonic.length - 1);
    !indexes.has(newIndex) && indexes.add(newIndex);
  }

  return indexes;
};
