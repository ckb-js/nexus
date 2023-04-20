import { Cell } from '@ckb-lumos/base';
import { BI, BIish } from '@ckb-lumos/bi';
import { randomOutput } from './random';

type GenerateConfig = { totalCapacity: BIish; count: number };

export function generateCells(config: GenerateConfig): Cell[] {
  const { totalCapacity, count } = config;

  const capacity = BI.from(totalCapacity);
  const average = capacity.div(BI.from(count));
  const remainder = capacity.mod(BI.from(count));

  const cells: Cell[] = [];

  for (let i = 0; i < count; i++) {
    const item = randomOutput();
    cells.push(item);
    if (i === count - 1) {
      item.cellOutput.capacity = average.add(remainder).toHexString();
      continue;
    }

    item.cellOutput.capacity = average.toHexString();
  }

  return cells;
}
