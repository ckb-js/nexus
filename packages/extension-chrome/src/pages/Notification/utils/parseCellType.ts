import { Cell } from '@ckb-lumos/lumos';
import { ReactNode } from 'react';
import { WellknownCellManager } from './WellkownCellManager';

export function parseCellType(cell: Cell): ReactNode {
  const { type } = cell.cellOutput;
  if (!type) {
    return '-';
  }
  const config = WellknownCellManager.query(type);

  return config?.parser(cell) ?? '-';
}
