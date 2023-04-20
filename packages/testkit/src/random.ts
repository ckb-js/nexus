import type { Cell, Hash, HashType, Hexadecimal, HexString, Script } from '@ckb-lumos/base';
import { randomBytes as _randomBytes } from 'crypto';
import { bytes } from '@ckb-lumos/codec';
import { minimalCellCapacityCompatible } from '@ckb-lumos/helpers';

export function randomBytes(size: number): HexString {
  return bytes.hexify(_randomBytes(size));
}

export function randomHexadecimal(min = 0, max = Infinity): Hexadecimal {
  const number = Math.floor(Math.random() * (max - min) + min);
  return '0x' + number.toString(16);
}

export function randomHash(size = 32): Hash {
  return randomBytes(size);
}

export function randomHashType(): HashType {
  const number = Math.random();
  if (number <= 0.33) return 'type';
  if (number <= 0.66) return 'data';
  return 'data1';
}

export function randomScript(): Script {
  return {
    codeHash: randomHash(),
    hashType: randomHashType(),
    args: randomBytes(20),
  };
}

export function randomInput(): Cell {
  const lockScript = randomScript();
  const typeScript = Math.random() > 0.5 ? undefined : randomScript();
  const cell: Cell = {
    cellOutput: {
      lock: lockScript,
      type: typeScript,
      // will rewrite later
      capacity: '0x0',
    },
    data: randomBytes(0),
    outPoint: {
      txHash: randomHash(),
      index: randomHexadecimal(0, 32),
    },
  };

  cell.cellOutput.capacity = minimalCellCapacityCompatible(cell).toHexString();
  return cell;
}

export function randomOutput(): Cell {
  const lockScript = randomScript();
  const typeScript = Math.random() > 0.5 ? undefined : randomScript();
  const cell: Cell = {
    cellOutput: {
      lock: lockScript,
      type: typeScript,
      // will rewrite later
      capacity: '0x0',
    },
    data: randomBytes(0),
  };

  cell.cellOutput.capacity = minimalCellCapacityCompatible(cell).toHexString();
  return cell;
}
