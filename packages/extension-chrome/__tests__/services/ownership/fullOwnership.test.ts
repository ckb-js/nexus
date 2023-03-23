import { config } from '@ckb-lumos/lumos';
import { Backend } from './../../../src/services/ownership/backend';
import { TransactionSkeletonType } from '@ckb-lumos/helpers';
import { TransactionSkeleton } from '@ckb-lumos/helpers';
import {
  createFullOwnershipService,
  createWatchtower,
  FULL_OWNERSHIP_EXTERNAL_PARENT_PATH,
  FULL_OWNERSHIP_INTERNAL_PARENT_PATH,
} from '../../../src/services/ownership';
import { createMockModule } from '../../helpers/createMockModule';
import { KeystoreService, OwnershipService } from '@nexus-wallet/types';
import { createScriptInfoDb, LockStatus, ScriptInfo } from '../../../src/services/ownership/storage';
import { createConfigService } from '../../../src/services/config';
import { createMockStorage } from '../../helpers/mockStorage';
import { asyncSleep } from '../../helpers/utils';
import { mockBackend } from '../../helpers/mockBackend';
import { mockPlatformService, MOCK_PLATFORM_URL } from '../../helpers';
import { bytes } from '@ckb-lumos/codec';
import { Script, utils, Transaction } from '@ckb-lumos/lumos';
import { common } from '@ckb-lumos/common-scripts';
import { createEventHub } from '../../../src/services/event';
import { SIGN_DATA_MAGIC } from '@nexus-wallet/protocol';

describe('FullOwnership', () => {
  describe('getOffChainLocks', function () {
    let ownershipService: OwnershipService;
    beforeAll(async () => {
      const storage = createMockStorage();
      const configService = createConfigService({ storage, eventHub: createEventHub() });
      const keystoreService = createMockModule<KeystoreService>({
        getPublicKeyByPath: () => bytes.hexify(Buffer.alloc(33)),
      });
      ownershipService = createFullOwnershipService({
        configService,
        keystoreService,
        platformService: mockPlatformService,
        storage,
        backendProvider: { resolve: () => mockBackend },
      });

      const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });
      const watchtower = createWatchtower({ scriptInfoDb: db, keystoreService, backend: mockBackend, configService });

      watchtower.run();
      await asyncSleep(100);
      watchtower.stop();
    });
    it('should get the first 20 locks of the external full-ownership', async () => {
      const locks = await ownershipService.getOffChainLocks({});
      expect(locks).toHaveLength(20);
    });

    it('should get the first 20 locks of the internal full-ownership', async () => {
      const locks = await ownershipService.getOffChainLocks({ change: 'internal' });
      expect(locks).toHaveLength(20);
    });
  });

  describe('getOnChainLocks, signData and signTx', function () {
    let ownershipService: OwnershipService;
    let keystoreService: KeystoreService;
    const scriptInfos: ScriptInfo[] = [
      createScriptInfo(1, '0x01', 'external', 'OffChain'),
      createScriptInfo(2, '0x02', 'external', 'OnChain'),
      createScriptInfo(3, '0x03', 'internal', 'OffChain'),
      createScriptInfo(4, '0x04', 'internal', 'OnChain'),
    ];
    const backend: Backend = {
      resolveTx: () => {
        return Promise.resolve({});
      },
      getSecp256k1Blake160ScriptConfig: () => {
        return Promise.resolve(config.predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160);
      },
      getLiveCellsByLocks: jest.fn().mockResolvedValue({
        cursor: '',
        objects: [],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    beforeAll(async () => {
      const storage = createMockStorage();
      const configService = createConfigService({ storage, eventHub: createEventHub() });
      keystoreService = createMockModule<KeystoreService>({
        getPublicKeyByPath: () => bytes.hexify(Buffer.alloc(33)),
        signMessage: jest.fn().mockImplementation(() => Promise.resolve('0x')),
      });
      ownershipService = createFullOwnershipService({
        configService,
        keystoreService,
        platformService: mockPlatformService,
        storage,
        backendProvider: {
          resolve: () => backend,
        },
      });
      const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });
      await db.setAll(scriptInfos);
    });
    it('should get the on-chain external locks of full-ownership', async () => {
      await expect(ownershipService.getOnChainLocks({})).resolves.toEqual({
        cursor: '2',
        objects: [scriptInfos[1].lock],
      });
    });
    it('should get the on-chain internal locks of full-ownership', async () => {
      await expect(ownershipService.getOnChainLocks({ change: 'internal' })).resolves.toEqual({
        cursor: '4',
        objects: [scriptInfos[3].lock],
      });
    });

    it('should get live cells', async () => {
      await ownershipService.getLiveCells({});
      expect(backend.getLiveCellsByLocks).toBeCalledWith({
        cursor: '',
        locks: [scriptInfos[1].lock, scriptInfos[3].lock],
      });
    });

    it('should signData by keystore service with proper params', async () => {
      await ownershipService.signData({ data: '0x1234', lock: scriptInfos[0].lock, url: MOCK_PLATFORM_URL });
      expect(keystoreService.signMessage).toBeCalledWith({
        message: bytes.hexify(bytes.concat(SIGN_DATA_MAGIC, '0x1234')),
        password: '12345678',
        path: `${scriptInfos[0].parentPath}/${scriptInfos[0].childIndex}`,
      });
      jest.clearAllMocks();
    });

    it('should signTx by keystore service with proper params', async () => {
      jest.spyOn(common, 'prepareSigningEntries').mockImplementation(() => createMockTxSkeleton());
      await ownershipService.signTransaction({ tx: {} as Transaction, url: MOCK_PLATFORM_URL });
      expect(keystoreService.signMessage).toHaveBeenCalledTimes(2);
      expect(keystoreService.signMessage).nthCalledWith(1, {
        message: '0x1234',
        password: '12345678',
        path: `${scriptInfos[0].parentPath}/${scriptInfos[0].childIndex}`,
      });
      expect(keystoreService.signMessage).nthCalledWith(2, {
        message: '0x5678',
        password: '12345678',
        path: `${scriptInfos[1].parentPath}/${scriptInfos[1].childIndex}`,
      });
      jest.clearAllMocks();
    });
  });
});

function createScriptInfo(id: number, args: string, change: 'external' | 'internal', status: LockStatus): ScriptInfo {
  const lock: Script = {
    codeHash: bytes.hexify(Buffer.alloc(32)),
    hashType: 'type',
    args,
  };
  return {
    id,
    lock,
    publicKey: '0x',
    parentPath: change === 'external' ? FULL_OWNERSHIP_EXTERNAL_PARENT_PATH : FULL_OWNERSHIP_INTERNAL_PARENT_PATH,
    childIndex: 0,
    status,
    scriptHash: utils.computeScriptHash(lock),
  };
}

function createMockTxSkeleton(): TransactionSkeletonType {
  let txSkeleton = TransactionSkeleton();
  txSkeleton = txSkeleton.update('inputs', (inputs) => {
    return inputs.push(
      {
        cellOutput: {
          capacity: '0x100000000',
          lock: createScriptInfo(1, '0x01', 'external', 'OnChain').lock,
        },
        data: '0x',
      },
      {
        cellOutput: {
          capacity: '0x100000000',
          lock: createScriptInfo(2, '0x02', 'external', 'OnChain').lock,
        },
        data: '0x',
      },
    );
  });
  txSkeleton = txSkeleton.update('signingEntries', (signingEntries) => {
    return signingEntries.push(
      {
        index: 0,
        message: '0x1234',
        type: '',
      },
      {
        index: 1,
        message: '0x5678',
        type: '',
      },
    );
  });
  return txSkeleton;
}
