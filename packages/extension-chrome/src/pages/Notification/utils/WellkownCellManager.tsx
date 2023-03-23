import React from 'react';
import { config } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { Cell, Script } from '@ckb-lumos/lumos';
import { ReactNode } from 'react';
import { Tooltip } from '@chakra-ui/react';

const DEPOSIT_CELL_DATA = '0x0000000000000000';
const predefinedTypes: TypeConfig[] = [];

for (const cfg of Object.values(config.predefined)) {
  const { DAO, SUDT } = cfg.SCRIPTS;
  predefinedTypes.push({
    type: {
      codeHash: DAO.CODE_HASH,
      hashType: DAO.HASH_TYPE,
      args: '0x',
    },
    parse(cell: Cell) {
      if (cell.data === DEPOSIT_CELL_DATA) {
        return 'DAO Deposit';
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
    parse(cell) {
      // TODO: SUDT value display
      return <Tooltip label={`Data: ${bytes.hexify(cell.data)}`}>SUDT</Tooltip>;
    },
  });
}

type TypeConfig = {
  type: Script;

  parse: (cell: Cell) => ReactNode;
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
