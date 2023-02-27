import { config } from '@ckb-lumos/lumos';
import { number } from '@ckb-lumos/codec';
import { Cell, Script } from '@ckb-lumos/lumos';

const DIPOSIT_CELL_DATA = '0x0000000000000000';
const predefinedTypes: TypeConfig[] = [];

for (const cfg of Object.values(config.predefined)) {
  const { DAO, SUDT } = cfg.SCRIPTS;
  predefinedTypes.push({
    type: {
      codeHash: DAO.CODE_HASH,
      hashType: DAO.HASH_TYPE,
      args: '0x',
    },
    parser(cell: Cell) {
      if (cell.data === DIPOSIT_CELL_DATA) {
        return 'DAO Diposit';
      } else {
        return 'DAO Withdraw';
      }
    },
  });

  predefinedTypes.push({
    type: {
      codeHash: SUDT.CODE_HASH,
      hashType: SUDT.HASH_TYPE,
      args: '0x',
    },
    parser(cell) {
      const val = number.Uint128LE.unpack(cell.data);
      return `${val.div(10 ** 8).toString()} SUDT`;
    },
  });
}

type TypeConfig = {
  type: Script;

  parser: (cell: Cell) => string;
};

function hashTypeScript(script: Script): string {
  return `${script.codeHash}-${script.hashType}`;
}

class WellknownCellManager {
  configs = new Map<string, TypeConfig>(predefinedTypes.map((cell) => [hashTypeScript(cell.type), cell]));

  query(type: Script): TypeConfig | undefined {
    return this.configs.get(hashTypeScript(type));
  }

  add(config: TypeConfig) {
    this.configs.set(hashTypeScript(config.type), config);
  }
}

const singleton = new WellknownCellManager();

export { singleton as WellknownCellManager };
