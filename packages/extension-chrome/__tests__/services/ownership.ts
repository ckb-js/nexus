import { CkbIndexer } from '@ckb-lumos/ckb-indexer/lib/indexer';
import { Keychain } from '@ckb-lumos/hd';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { config, Script } from '@ckb-lumos/lumos';
import { Backend } from '../../src/services/backend';
import { createOwnershipService } from '../../src/services/ownership';

// https://en.bitcoin.it/wiki/BIP_0032_TestVectors
const shortSeed = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');

const testKeychain = Keychain.fromSeed(shortSeed);

const locks: Script[] = [];
for (let index = 0; index < 10; index++) {
  const currentKeychain = testKeychain.derivePath(`m/44'/309'/0'/0/${index}`);
  const scriptArgs = publicKeyToBlake160(`0x${currentKeychain.publicKey.toString('hex')}`);
  locks.push({
    codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hashType: 'type',
    args: scriptArgs,
  });
}

it('ownership#get 10 locks', async () => {
  expect(locks.length).toBe(10);
});

it('ownership#get used locks return empty list', async () => {
  const keychain = Keychain.fromSeed(shortSeed);
  expect(keychain.privateKey.toString('hex')).toEqual(
    'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35',
  );

  const mockBackend: Backend = {
    countTx: async () => 0,
    nodeUri: '',
    indexer: new CkbIndexer(''),
  };
  const service = createOwnershipService(keychain, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({ cursor: '', objects: [] });
});

it('ownership#get used locks return fisrt lock', async () => {
  const keychain = Keychain.fromSeed(shortSeed);
  const mockCallback = jest.fn().mockReturnValueOnce(Promise.resolve(1)).mockReturnValue(Promise.resolve(0));
  const mockBackend: Backend = {
    countTx: mockCallback,
    nodeUri: '',
    indexer: new CkbIndexer(''),
  };
  const service = createOwnershipService(keychain, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({
    cursor: '',
    objects: [locks[0]],
  });
});
it('ownership#get used locks return 1st lock and 6th lock', async () => {
  const keychain = Keychain.fromSeed(shortSeed);
  const mockCallback = jest
    .fn()
    .mockReturnValueOnce(Promise.resolve(1)) // m/44'/309'/0'/0/0
    .mockReturnValueOnce(Promise.resolve(0)) // m/44'/309'/0'/1/0
    .mockReturnValueOnce(Promise.resolve(0)) // m/44'/309'/0'/0/1
    .mockReturnValueOnce(Promise.resolve(0)) // m/44'/309'/0'/0/2
    .mockReturnValueOnce(Promise.resolve(0)) // m/44'/309'/0'/0/3
    .mockReturnValueOnce(Promise.resolve(0)) // m/44'/309'/0'/0/4
    .mockReturnValueOnce(Promise.resolve(1)) // m/44'/309'/0'/0/5
    .mockReturnValue(Promise.resolve(0));
  const mockBackend: Backend = {
    countTx: mockCallback,
    nodeUri: '',
    indexer: new CkbIndexer(''),
  };
  const service = createOwnershipService(keychain, mockBackend);
  const usedLocks = await service.getUsedLocks({});
  expect(usedLocks).toEqual({
    cursor: '',
    objects: [locks[0], locks[5]],
  });
});
