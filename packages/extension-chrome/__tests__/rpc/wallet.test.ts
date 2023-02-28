import { bytes } from '@ckb-lumos/codec';
import { Backend } from './../../src/services/ownership/backend';
import { FULL_OWNERSHIP_INTERNAL_PARENT_PATH } from './../../src/services/ownership/constants';
import { LockStatus, ScriptInfo } from './../../src/services/ownership/storage';
import { Script, utils } from '@ckb-lumos/lumos';
import { createConfigService } from '../../src/services/config';
import { FULL_OWNERSHIP_EXTERNAL_PARENT_PATH } from '../../src/services/ownership';
import { createScriptInfoDb } from '../../src/services/ownership/storage';
import { createMockStorage } from '../helpers/mockStorage';
import { createTestRpcServer } from './helper';

describe('RPC wallet_enable', () => {
  it('should request be allowed when Nexus is initialized', async () => {
    const { request, factory } = createTestRpcServer();

    const keystoreService = factory.get('keystoreService');
    await expect(Promise.resolve(keystoreService.hasInitialized())).resolves.toBe(true);

    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.reject());

    await expect(request('wallet_enable')).rejects.toThrowError(/has rejected/);

    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    await expect(request('wallet_enable')).resolves.not.toThrowError();
  });
});
describe('RPC wallet_fullOwnership', () => {
  const scriptInfos: ScriptInfo[] = [
    createScriptInfo(1, '0x01', 'external', 'OffChain'),
    createScriptInfo(2, '0x02', 'external', 'OnChain'),
    createScriptInfo(3, '0x03', 'internal', 'OffChain'),
    createScriptInfo(4, '0x04', 'internal', 'OnChain'),
  ];
  it('should request wallet_fullOwnership_getOffChainLocks return empty array when storage is empty', async () => {
    const { request } = createTestRpcServer();
    await expect(request('wallet_fullOwnership_getOffChainLocks', {})).resolves.toEqual([]);
  });
  it('should request wallet_fullOwnership_getOffChainLocks return some script when storage is not empty', async () => {
    const storage = createMockStorage();
    const configService = createConfigService({ storage });
    const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });

    await db.setAll(scriptInfos);
    const { request, factory } = createTestRpcServer({ storage: () => storage });
    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    await request('wallet_enable');
    await expect(request('wallet_fullOwnership_getOffChainLocks', {})).resolves.toEqual([scriptInfos[0].lock]);
    await expect(request('wallet_fullOwnership_getOffChainLocks', { change: 'internal' })).resolves.toEqual([
      scriptInfos[2].lock,
    ]);
  });

  it('should request wallet_fullOwnership_getOnChainLocks return empty array when storage is empty', async () => {
    const { request } = createTestRpcServer();
    await expect(request('wallet_fullOwnership_getOnChainLocks', {})).resolves.toEqual({
      cursor: undefined,
      objects: [],
    });
  });
  it('should request wallet_fullOwnership_getOnChainLocks return some script when storage is not empty', async () => {
    const storage = createMockStorage();
    const configService = createConfigService({ storage });
    const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });

    await db.setAll(scriptInfos);
    const { request, factory } = createTestRpcServer({ storage: () => storage });
    const platformService = factory.get('platformService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    await request('wallet_enable');
    await expect(request('wallet_fullOwnership_getOnChainLocks', {})).resolves.toEqual({
      cursor: '2',
      objects: [scriptInfos[1].lock],
    });
    await expect(request('wallet_fullOwnership_getOnChainLocks', { change: 'internal' })).resolves.toEqual({
      cursor: '4',
      objects: [scriptInfos[3].lock],
    });
  });

  it('should request wallet_fullOwnership_getLiveCells return empty array when storage is empty', async () => {
    const { request } = createTestRpcServer();
    await expect(request('wallet_fullOwnership_getLiveCells', {})).resolves.toEqual({ cursor: '', objects: [] });
  });
  it('should request wallet_fullOwnership_getLiveCells return some script when storage is not empty', async () => {
    const storage = createMockStorage();
    const configService = createConfigService({ storage });
    const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });

    await db.setAll(scriptInfos);
    const { request, factory } = createTestRpcServer({ storage: () => storage });
    const platformService = factory.get('platformService');
    const backendProvider = factory.get('backendProvider');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockBackend = {
      getLiveCellsByLocks: jest.fn().mockImplementation(() => Promise.resolve([])),
    } as unknown as Backend;
    jest.spyOn(backendProvider, 'resolve').mockImplementation(() => Promise.resolve(mockBackend));
    await request('wallet_enable');
    await request('wallet_fullOwnership_getLiveCells', {});
    expect(mockBackend.getLiveCellsByLocks).toBeCalledWith({
      cursor: '',
      locks: [scriptInfos[1].lock, scriptInfos[3].lock],
    });
  });

  it('should request wallet_fullOwnership_signData call keystore service with proper params', async () => {
    const storage = createMockStorage();
    const configService = createConfigService({ storage });
    const db = createScriptInfoDb({ storage, networkId: (await configService.getSelectedNetwork()).id });

    await db.setAll(scriptInfos);
    const { request, factory } = createTestRpcServer({ storage: () => storage });
    const platformService = factory.get('platformService');
    const keystoreService = factory.get('keystoreService');
    jest.spyOn(platformService, 'requestGrant').mockImplementation(() => Promise.resolve());
    jest.spyOn(platformService, 'requestSignData').mockImplementation(() => Promise.resolve({ password: '123456' }));
    jest.spyOn(keystoreService, 'signMessage').mockImplementation(() => Promise.resolve(''));
    await request('wallet_enable');
    await request('wallet_fullOwnership_signData', { data: '0x1234', lock: scriptInfos[0].lock });
    expect(keystoreService.signMessage).toBeCalledWith({
      message: '0x1234',
      password: '123456',
      path: `${scriptInfos[0].parentPath}/${scriptInfos[0].childIndex}`,
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
