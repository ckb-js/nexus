import { Cell } from '@ckb-lumos/lumos';
import { WellknownCellManager } from './WellkownCellManager';

export function parseCellType(cell: Cell): string {
  const { type } = cell.cellOutput;
  if (!type) {
    return '-';
  }
  const config = WellknownCellManager.query(type);

  return config?.parser(cell) ?? '-';
}
