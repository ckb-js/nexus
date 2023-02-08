import { asserts } from '@nexus-wallet/utils';
import random from 'lodash/random';

export const randomPickMnemonicPositions = (mnemonic: string[], length = mnemonic.length): Set<number> => {
  const indexes = new Set<number>();

  asserts.nonFalsy(mnemonic.length >= length);

  while (indexes.size < length) {
    const newIndex = random(0, mnemonic.length - 1);
    !indexes.has(newIndex) && indexes.add(newIndex);
  }

  return indexes;
};
