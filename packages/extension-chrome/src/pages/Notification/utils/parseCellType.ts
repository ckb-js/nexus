import { Cell, Script } from '@ckb-lumos/lumos';

type CellParser = {
  type: Script;
  parseValue: (cell: Cell) => string;
};

const cellParsers: CellParser[] = [];

// TODO: finish cell parser
export function parseCellType(cell: Cell): string {
  const { cellOutput } = cell;
  if (!cellOutput.type) return '-';

  const parser = cellParsers.find((parser) => parser.type === cellOutput.type);

  if (parser) {
    return parser.parseValue(cell);
  }

  return '-';
}
