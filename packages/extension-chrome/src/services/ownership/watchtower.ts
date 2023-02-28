import { Backend } from './backend';
import { createLogger } from '@nexus-wallet/utils';
import { asserts } from '@nexus-wallet/utils/lib/asserts';
import { KeystoreService } from '@nexus-wallet/types';
import { utils } from '@ckb-lumos/lumos';
import { ScriptInfo, ScriptInfoDb } from './storage';
import zip from 'lodash.zip';
import maxBy from 'lodash.maxby';
import {
  FULL_OWNERSHIP_EXTERNAL_PARENT_PATH,
  FULL_OWNERSHIP_INTERNAL_PARENT_PATH,
  FULL_OWNERSHIP_OFF_CHAIN_GAP,
  RULE_BASED_OFF_CHAIN_GAP,
  RULE_BASED_PARENT_PATH,
} from './constants';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';

const logger = createLogger('Watchtower');
const DEFAULT_SCAN_INTERVAL = 10_000;

export interface Watchtower {
  run(): void;
  stop(): void;
}

interface WatchtowerOptions {
  /**
   * scan interval in milliseconds
   */
  scanInterval?: number;
}

export function createWatchtower({
  db,
  backend,
  keystoreService,
  options = {},
}: {
  db: ScriptInfoDb;
  backend: Backend;
  keystoreService: KeystoreService;
  options?: WatchtowerOptions;
}): Watchtower {
  /**
   * generate off-chain script infos between [startChildIndex, endChildIndex)
   * @param parentPath
   * @param startInfoId
   * @param startChildIndex
   * @param endChildIndex
   */
  async function generateOffChainInfos(
    parentPath: string,
    startInfoId: number,
    startChildIndex: number,
    endChildIndex = startChildIndex + 1,
  ): Promise<ScriptInfo[]> {
    const { CODE_HASH, HASH_TYPE } = await backend.getSecp256k1Blake160ScriptConfig();
    const lockTemplate = { codeHash: CODE_HASH, hashType: HASH_TYPE };

    const result: ScriptInfo[] = [];

    let currentChildIndex = startChildIndex;
    while (currentChildIndex < endChildIndex) {
      const publicKey = await keystoreService.getPublicKeyByPath({ path: `${parentPath}/${currentChildIndex}` });
      const lock = { ...lockTemplate, args: publicKeyToBlake160(publicKey) };
      result.push({
        parentPath,
        childIndex: currentChildIndex,
        publicKey: publicKey,
        lock: lock,
        status: 'OffChain',
        scriptHash: utils.computeScriptHash(lock),
        id: startInfoId++,
      });

      currentChildIndex++;
    }

    return result;
  }

  async function initIfNeeded(): Promise<void> {
    const infos = await db.getAll();
    if (infos.length > 0) return;

    const externalFullOwnershipInfos = await generateOffChainInfos(
      FULL_OWNERSHIP_EXTERNAL_PARENT_PATH,
      1,
      0,
      FULL_OWNERSHIP_OFF_CHAIN_GAP,
    );
    const internalFullOwnershipInfos = await generateOffChainInfos(
      FULL_OWNERSHIP_INTERNAL_PARENT_PATH,
      externalFullOwnershipInfos.length + 1,
      0,
      FULL_OWNERSHIP_OFF_CHAIN_GAP,
    );
    const ruleBasedOwnershipInfos = await generateOffChainInfos(
      RULE_BASED_PARENT_PATH,
      externalFullOwnershipInfos.length + internalFullOwnershipInfos.length + 1,
      0,
      RULE_BASED_OFF_CHAIN_GAP,
    );

    await db.setAll([...externalFullOwnershipInfos, ...internalFullOwnershipInfos, ...ruleBasedOwnershipInfos]);
  }

  // update off-chain locks to on-chain locks if they are scanned on-chain
  async function scanAndUpdate(): Promise<number> {
    await initIfNeeded();
    const infos = await db.getAll();

    // get off-chain locks
    const offChainInfos = infos.filter((info) => info.status === 'OffChain');
    // check if locks are on-chain
    const infosOnChained = await backend.hasHistories({ locks: offChainInfos.map((info) => info.lock) });

    // filter out on-chain infos
    const newOnChainedInfos: ScriptInfo[] = zip(infosOnChained, offChainInfos)
      .filter(([onChained]) => onChained === true)
      .map(([_, info]) => {
        // for type safety
        asserts(info);
        return info;
      });

    if (newOnChainedInfos.length === 0) {
      return 0;
    }

    const newOnChainedInfoIds = newOnChainedInfos.map((info) => info.id);
    // update status
    infos.forEach((info) => {
      if (newOnChainedInfoIds.includes(info.id)) {
        info.status = 'OnChain';
      }
      return info;
    });

    type LastChildIndexMap = Record<string /*parentPath*/, number /*childIndex*/>;
    const lastChildIndexMap: LastChildIndexMap = infos.reduce<LastChildIndexMap>((indexMap, info) => {
      indexMap[info.parentPath] = Math.max(info.childIndex, indexMap[info.parentPath] ?? 0);
      return indexMap;
    }, {});
    let lastId = maxBy(infos, 'id')?.id;

    asserts(lastId, 'lastId should not be falsy, you have cleared the db?');

    // supplied off-chain locks to fill in the gaps
    const newOffChainInfos: ScriptInfo[] = await (async () => {
      let result = [];

      for (const info of newOnChainedInfos) {
        const nextId = ++lastId;
        const nextChildIndex = ++lastChildIndexMap[info.parentPath];

        const [newOffChainInfo] = await generateOffChainInfos(info.parentPath, nextId, nextChildIndex);
        result.push(newOffChainInfo);
      }

      return result;
    })();

    await db.setAll(infos.concat(newOffChainInfos));

    return newOnChainedInfos.length;
  }

  let stopCalled = false;

  async function asyncRun() {
    while (1) {
      if (stopCalled) {
        break;
      }

      try {
        await scanAndUpdate();
      } catch (e) {
        logger.error(`Scan error`, e);
      } finally {
        await asyncSleep(options.scanInterval ?? DEFAULT_SCAN_INTERVAL);
      }
    }
  }

  return {
    run: asyncRun,
    stop: () => {
      stopCalled = true;
    },
  };
}

function asyncSleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
