import type { KeystoreService, Storage } from '@nexus-wallet/types';
import { createInMemoryStorage } from '../../src/services/storage';
import { assertDerivationPath, createKeystoreService } from '../../src/services/keystore';
import hd from '@ckb-lumos/hd';

describe('assertDerivationPath', () => {
  test('normal', () => {
    expect(() => assertDerivationPath(`m/44'/309'/0'/0/0`)).not.toThrow();
  });

  test('incorrect path', () => {
    expect(() => assertDerivationPath(`m/incorrect/path`)).toThrow();
  });

  test('incorrect options', () => {
    expect(() => assertDerivationPath(`m/44'/309'/0'/0/0`, { hardened: true, nonhardened: true })).toThrow();
  });

  test('hardened', () => {
    expect(() => assertDerivationPath(`m/44'/309'/0'`, { hardened: true })).not.toThrow();
    expect(() => assertDerivationPath(`m/44'/309'/0'/0`, { hardened: true })).toThrow();
  });

  test('nonhardened', () => {
    expect(() => assertDerivationPath(`m/44'/309'/0'`, { nonhardened: true })).toThrow();
    expect(() => assertDerivationPath(`m/44'/309'/0'/0`, { nonhardened: true })).not.toThrow();
  });
});

//https://github.com/nervosnetwork/neuron/blob/80b58022a3857ba36494e6dad90ac21ef32caae8/packages/neuron-wallet/tests/models/keys/keychain.test.ts#L154-L193
const fixture = {
  mnemonic: 'tank planet champion pottery together intact quick police asset flower sudden question',
  privateKey: '0x37d25afe073a6ba17badc2df8e91fc0de59ed88bcad6b9a0c2210f325fafca61',
  publicKey: '0x020720a7a11a9ac4f0330e2b9537f594388ea4f1cd660301f40b5a70e0bc231065',
  chainCode: '0x5f772d1e3cfee5821911aefa5e8f79d20d4cf6678378d744efd08b66b2633b80',
  derived: [
    // parent
    {
      path: `m/44'/309'/0'/0`,
      privateKey: '0x047fae4f38b3204f93a6b39d6dbcfbf5901f2b09f6afec21cbef6033d01801f1',
      publicKey: '0x03d0b797208fa010610f03e86776d15fec29de0b7b40b7a0baad63a8667385c2d6',
    },
    // child, one more `/0` then parent
    {
      path: `m/44'/309'/0'/0/0`,
      privateKey: '0x848422863825f69e66dc7f48a3302459ec845395370c23578817456ad6b04b14',
      publicKey: '0x034dc074f2663d73aedd36f5fc2d1a1e4ec846a4dffa62d8d8bae8a4d6fffdf2b0',
    },
  ],
};

describe('KeystoreService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storage: Storage<any>;
  let service: KeystoreService;

  beforeAll(async () => {
    storage = createInMemoryStorage();
    service = createKeystoreService({ storage });

    const parent = fixture.derived[0];
    await service.initKeystore({
      mnemonic: fixture.mnemonic,
      // parent path
      paths: [parent.path],
      password: '123456',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('re-initialize should throw error', async () => {
    await expect(
      service.initKeystore({
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        paths: [`m/44'/309'/0'/0`],
        password: '123456',
      }),
    ).rejects.toThrow();
  });

  test('getExtendedPublicKey should works', async () => {
    const child = fixture.derived[1];
    const childPublicKey0 = await service.getExtendedPublicKey({ path: child.path });

    expect(childPublicKey0).toBe(child.publicKey);
  });

  test('should sign message as expected if the password is correct', async () => {
    const mockedMessage = '0x00';
    const mockedSignature = '0x01';

    const mockedSign = jest.spyOn(hd.key, 'signRecoverable');
    mockedSign.mockReturnValueOnce(mockedSignature);

    const child = fixture.derived[1];
    expect(await service.signMessage({ path: child.path, message: mockedMessage, password: '123456' }));

    expect(mockedSign.mock.calls[0][0]).toBe(mockedMessage);
    expect(mockedSign.mock.calls[0][1]).toBe(child.privateKey);
  });

  test('should throw when the password is incorrect', async () => {
    await expect(
      service.signMessage({ path: `m/44'/309'/0'/0/0`, message: '0x00', password: 'incorrect password' }),
    ).rejects.toThrow();
  });

  test('storage should be empty after reset()', async () => {
    await service.reset();
    await expect(Promise.resolve(storage.getItem('keystore'))).resolves.toBeFalsy();
  });
});
