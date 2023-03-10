import { Storage } from '@nexus-wallet/types';
import { HexString, Script } from '@ckb-lumos/lumos';

export interface ScriptInfoDb {
  getAll(): Promise<ScriptInfo[]>;
  setAll(infos: ScriptInfo[]): Promise<void>;
  filterByMatch(filter: Partial<ScriptInfo>): Promise<ScriptInfo[]>;
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
  };
}
