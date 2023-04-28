import { Script, utils } from '@ckb-lumos/lumos';
import { Storage } from '@nexus-wallet/types';
import { createScriptInfoDb, ScriptInfo } from '../../../src/services/ownership/storage';
import { createInMemoryStorage } from '../../../src/services/storage';
import { randomScript } from '@nexus-wallet/testkit';

describe('ScriptInfoDb', () => {
  it('should correctly find out derived locks', async () => {
    const storage: Storage<any> = createInMemoryStorage();
    const scriptInfoDb = createScriptInfoDb({ storage, networkId: 'mainnet' });

    const lock1 = randomScript();
    const lock2 = randomScript();
    await scriptInfoDb.setAll(createScriptInfos([lock1, lock2]));

    const lock3 = randomScript();

    await expect(scriptInfoDb.isDerivedLocks([lock1])).resolves.toEqual([true]);
    await expect(scriptInfoDb.isDerivedLocks([lock3])).resolves.toEqual([false]);
    await expect(scriptInfoDb.isDerivedLocks([lock1, lock1, lock2, lock2, lock3])).resolves.toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
  });
});

function createScriptInfos(scripts: Script[]): ScriptInfo[] {
  return scripts.map((script, index) => ({
    id: index,
    lock: script,
    publicKey: '0x',
    parentPath: '',
    childIndex: index,
    status: 'OffChain',
    scriptHash: utils.computeScriptHash(script),
  }));
}
