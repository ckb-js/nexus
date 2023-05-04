import { Storage } from '@nexus-wallet/types';
import { HexString, Script, utils } from '@ckb-lumos/lumos';

export interface ScriptInfoDb {
  getAll(): Promise<ScriptInfo[]>;
  setAll(infos: ScriptInfo[]): Promise<void>;
  filterByMatch(filter: Partial<ScriptInfo>): Promise<ScriptInfo[]>;
  isDerivedLocks(scripts: Script[]): Promise<boolean[]>;
}

export type OwnershipStorage = Storage<Record<NetworkId, ScriptInfo[]>>;

export interface ScriptInfo {
  // an auto-incremented id
  id: number;
  lock: Script;
  publicKey: HexString;
  parentPath: string;
  childIndex: number;
  status: LockStatus;
  scriptHash: HexString;
}

export type LockStatus = 'OnChain' | 'OffChain';

export type NetworkId = string;

export function createScriptInfoDb(payload: { networkId: string; storage: OwnershipStorage }): ScriptInfoDb {
  const { networkId, storage } = payload;

  const storageKey = `${networkId}:scriptInfo`;

  async function getAll() {
    const infos = await storage.getItem(storageKey);
    if (!infos) {
      await storage.setItem(storageKey, []);
    }

    return infos ?? [];
  }

  return {
    getAll: async () => {
      return getAll();
    },
    setAll: async (infos) => {
      return storage.setItem(storageKey, infos);
    },
    filterByMatch: async (match) => {
      const infos = await getAll();
      return infos.filter((info) => {
        return Object.keys(match).every((key) => {
          let k = key as keyof ScriptInfo;
          return info[k] === match[k];
        });
      });
    },
    isDerivedLocks: async (scripts: []): Promise<boolean[]> => {
      const infos = await getAll();
      return scripts.map((script) => !!infos.find((info) => info.scriptHash === utils.computeScriptHash(script)));
    },
  };
}
