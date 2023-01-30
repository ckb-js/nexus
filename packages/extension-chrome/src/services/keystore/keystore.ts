import type { HexString } from '@ckb-lumos/lumos';
import type { KeystoreService, Promisable, Storage } from '@nexus-wallet/types';
import type {
  GetExtendedPublicKeyPayload,
  InitKeyStorePayload,
  SignMessagePayload,
  NonHardenedPath,
} from '@nexus-wallet/types/lib/services/KeystoreService';
import { asserts, errors, resolveProvider } from '@nexus-wallet/utils';
import { hd } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { key, Keystore } from '@ckb-lumos/hd';

export function createKeyStoreService(config: { storage: Storage<KeystoreData> }): KeystoreService {
  const { storage } = config;

  async function resolveKeystoreData(): Promise<KeystoreData['keystore']> {
    const keystoreData = await storage.getItem('keystore');

    if (!keystoreData) {
      errors.throwError('Keystore not initialized');
    }

    return keystoreData;
  }

  const keystoreService: KeystoreService = {
    initKeyStore: async (payload: InitKeyStorePayload): Promise<void> => {
      const isInitialized = await keystoreService.hasInitialized();

      if (isInitialized) errors.throwError('Keystore has been initialized');

      const { mnemonic: inputMnemonic, password, paths } = payload;

      paths.forEach((path) => {
        assertDerivationPath(path, { hardened: false });
      });

      const seed = await hd.mnemonic.mnemonicToSeed(inputMnemonic);
      const keychain = hd.Keychain.fromSeed(seed);

      const publicInfos = paths.reduce((result, path) => {
        const childChain = keychain.derivePath(path);
        return result.concat({
          path,
          publicKey: bytes.hexify(childChain.publicKey),
          chainCode: bytes.hexify(childChain.chainCode),
        });
      }, [] as PublicInfo[]);

      const wss = hd.Keystore.create(hd.ExtendedPrivateKey.fromSeed(seed), password).toJson();

      storage.setItem('keystore', { publicInfos, wss });
    },

    getExtendedPublicKey: async (payload: GetExtendedPublicKeyPayload): Promise<string> => {
      const { path } = payload;

      assertDerivationPath(path);

      const keystoreData = await resolveKeystoreData();

      const parent = keystoreData.publicInfos.find((publicInfo) => path.includes(publicInfo.path));
      asserts.asserts(parent, `Extended public key not found for path: %s`, path);

      if (parent.path === path) return parent.publicKey;

      // TODO: update lumos/hd to support BytesLike param instead of Buffer
      const extendedPublicKey = hd.Keychain.fromPublicKey(
        Buffer.from(bytes.bytify(parent.publicKey)),
        Buffer.from(bytes.bytify(parent.chainCode)),
        parent.path,
      );

      // the child path is the path after the parent path
      // e.g. parent path: m/44'/309'/0'/0
      //      child path:  m/44'/309'/0'/0/0
      // to derive child public key, we can use the API parent.derivePath('0/0')
      const childPath = path.replace(parent.path + '/', '');

      return bytes.hexify(extendedPublicKey.derivePath(childPath).publicKey);
    },

    hasInitialized: (): Promisable<boolean> => {
      return storage.hasItem('keystore');
    },

    signMessage: async (payload: SignMessagePayload): Promise<HexString> => {
      const keystoreData = await resolveKeystoreData();

      const keystore = Keystore.fromJson(keystoreData.wss);
      const extendedPrivateKey = keystore.extendedPrivateKey(await resolveProvider(payload.password));

      return key.signRecoverable(
        bytes.hexify(payload.message),
        extendedPrivateKey.privateKeyInfoByPath(payload.path).privateKey,
      );
    },

    reset: async () => {
      await storage.removeItem('keystore');
    },
  };

  return keystoreService;
}

export function assertDerivationPath(path: string, options: { hardened?: boolean; nonhardened?: boolean } = {}): void {
  if (options.hardened && options.nonhardened) {
    errors.throwError(`"hardened" or "nonhardened" can only be one of them in options`);
  }

  if (!isValidDerivationPath(path)) {
    errors.throwError(`Invalid derivation path: %s`, path);
  }

  if (options.hardened && !isHardenedPath(path)) {
    errors.throwError(`Derivation path must be hardened: %s`, path);
  }

  if (options.nonhardened && isHardenedPath(path)) {
    errors.throwError(`Derivation path must be non-hardened: %s`, path);
  }
}

function isHardenedPath(path: string): boolean {
  return path.endsWith("'");
}

const DERIVATION_PATH_REGEX = /^m(\/\d+'?)*$/;

function isValidDerivationPath(path: string): boolean {
  return path.match(DERIVATION_PATH_REGEX) !== null;
}

interface KeystoreData {
  keystore: {
    publicInfos: PublicInfo[];
    // Web3 Secret Storage, it is a string in JSON format
    wss: string;
  };
}

interface PublicInfo {
  path: NonHardenedPath;
  chainCode: HexString;
  publicKey: HexString;
}
