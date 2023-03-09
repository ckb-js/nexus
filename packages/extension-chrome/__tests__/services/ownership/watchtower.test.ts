import {
  createWatchtower,
  FULL_OWNERSHIP_EXTERNAL_PARENT_PATH,
  FULL_OWNERSHIP_INTERNAL_PARENT_PATH,
  RULE_BASED_PARENT_PATH,
} from '../../../src/services/ownership';
import { KeystoreService } from '@nexus-wallet/types';
import { createScriptInfoDb, ScriptInfo } from '../../../src/services/ownership/storage';
import { Backend } from '../../../src/services/ownership/backend';
import { createMockModule } from '../../helpers/createMockModule';
import { bytes } from '@ckb-lumos/codec';
import { createMockStorage } from '../../helpers/mockStorage';
import { FULL_OWNERSHIP_OFF_CHAIN_GAP, RULE_BASED_OFF_CHAIN_GAP } from '../../../src/services/ownership/constants';
import { asyncSleep } from '../../helpers/utils';
import { mockBackend } from '../../helpers/mockBackend';
import { createConfigService } from '../../../src/services/config';
import { createEventHub } from '../../../src/services/event';

const INIT_LENGTH = FULL_OWNERSHIP_OFF_CHAIN_GAP + FULL_OWNERSHIP_OFF_CHAIN_GAP + RULE_BASED_OFF_CHAIN_GAP;

const backend = mockBackend;

const keystoreService = createMockModule<KeystoreService>({
  getPublicKeyByPath: () => bytes.hexify(Buffer.alloc(33)),
});

describe('Watchtower', () => {
  it('should init with GAP infos', async () => {
    const db = createScriptInfoDb({ storage: createMockStorage(), networkId: 'mainnet' });
    const configService = createConfigService({ storage: createMockStorage(), eventHub: createEventHub() });
    const watchtower = createWatchtower({ keystoreService, backend, scriptInfoDb: db, configService });

    watchtower.run();
    await asyncSleep(100);
    watchtower.stop();

    const infos = await db.getAll();
    expect(infos).toHaveLength(INIT_LENGTH);
    expect(filter(infos, { parentPath: FULL_OWNERSHIP_EXTERNAL_PARENT_PATH })).toHaveLength(
      FULL_OWNERSHIP_OFF_CHAIN_GAP,
    );
    expect(filter(infos, { parentPath: FULL_OWNERSHIP_INTERNAL_PARENT_PATH })).toHaveLength(
      FULL_OWNERSHIP_OFF_CHAIN_GAP,
    );
    expect(filter(infos, { parentPath: RULE_BASED_PARENT_PATH })).toHaveLength(RULE_BASED_OFF_CHAIN_GAP);
  });

  it('should update infos when backend has history', async () => {
    const db = createScriptInfoDb({ storage: createMockStorage(), networkId: 'mainnet' });
    const configService = createConfigService({ storage: createMockStorage(), eventHub: createEventHub() });
    const pubkeys = Array.from({ length: 100 }).map((_, i) => {
      const buf = Buffer.alloc(33);
      buf.writeUint8(i);
      return bytes.hexify(buf);
    });

    const keystoreService = createMockModule<KeystoreService>({
      getPublicKeyByPath: ({ path }) => pubkeys[getChildIndex(path)],
    });

    const newBackend: Backend = {
      ...backend,
      hasHistories: async ({ locks }) => {
        // the first 2 locks have transaction history
        return [true, true].concat(new Array<boolean>(locks.length - 2).fill(false));
      },
    };

    const watchtower = createWatchtower({ keystoreService, backend: newBackend, scriptInfoDb: db, configService });

    watchtower.run();
    await asyncSleep(100);

    watchtower.stop();

    const infos = await db.getAll();
    expect(infos).toHaveLength(INIT_LENGTH + 2);

    expect(infos[0].status).toBe('OnChain');
    expect(infos[1].status).toBe('OnChain');
    expect(infos.slice(2).every((info) => info.status === 'OffChain')).toBe(true);

    // supplied for infos[1]
    const expectedLastScriptInfo: Partial<ScriptInfo> = {
      parentPath: infos[0].parentPath,
      // gap + 1 because the first 2 infos are on-chain
      childIndex: FULL_OWNERSHIP_OFF_CHAIN_GAP + 1,
      publicKey: pubkeys[FULL_OWNERSHIP_OFF_CHAIN_GAP + 1],
      status: 'OffChain',
    };
    expect(infos[infos.length - 1]).toMatchObject(expectedLastScriptInfo);
  });
});

function filter<T>(items: T[], match: Partial<T>): T[] {
  return items.filter((item) => {
    for (const key of Object.keys(match)) {
      // @ts-ignore
      if (item[key] !== match[key]) {
        return false;
      }
    }
    return true;
  });
}

function getChildIndex(path: string): number {
  return parseInt(path.split('/').pop()!);
}
