import { createInMemoryStorage } from '../../src/services/storage';
import { Storage } from '@nexus-wallet/types';

/**
 * a mocked storage with init wallet with
 * <pre>
 * {
 *     nickname: 'Nexus Dev',
 *     mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
 *     password: '12345678', // MOCK_PLATFORM_PASSWORD
 * }
 * </pre>
 * use it to avoid the need to init wallet in each test
 */
export const mockStorage = createMockStorage();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockStorage(): Storage<any> {
  const mockStorage = createInMemoryStorage();

  mockStorage.setAll({
    config: {
      version: '0.0.1',
      whitelist: [],
      nickname: 'Nexus Dev',
      networks: [
        {
          id: 'mainnet',
          networkName: 'ckb',
          displayName: 'Mainnet',
          rpcUrl: 'https://mainnet.ckb.dev',
        },
        {
          id: 'testnet',
          networkName: 'ckb_testnet',
          displayName: 'Testnet',
          rpcUrl: 'https://testnet.ckb.dev',
        },
      ],
      selectedNetwork: 'testnet',
    },
    keystore: {
      publicInfos: [
        {
          path: "m/44'/309'/0'/0",
          publicKey: '0x03a82e301972d5b2f7b9bf5b904f9b491db9f46bb059da60c88222b75ef892c665',
          chainCode: '0x4c2acb8da2a47eac2ac703246d0392960b58830c769e985f822201269e8cc94f',
        },
        {
          path: "m/44'/309'/0'/1",
          publicKey: '0x02f77ad091450c9d63d99325f41ba5aeddc880d22b63e77e94865318e1f64b0688',
          chainCode: '0xa7e643821843cc1c856db4cfaa6752d3afb99321b2a349c2434a9f5961341535',
        },
        {
          path: "m/4410179'/0'",
          publicKey: '0x02ae6dc25eb4244648868b01c50bed8435820f72d629c0a34a9014b4440d98d5fb',
          chainCode: '0x8a6e51b51b16c304ee50daca76bef6b6cda970c5a7916eeb3f555f34ea82380d',
        },
      ],
      wss: '{"version":3,"crypto":{"ciphertext":"9e2be7be3eeff3154e1c677f7ff96ca0f740a44a1d4c045cd25358734631597a13289d787ca6088205548bd306c1fcfa328a4d6ee67381690344b61195bc998f","cipherparams":{"iv":"3343a3ed7f49fc5a34af4a7e5f5015bb"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"f96cd71b809d2d3ddf2e3957fe46f2c20dda388417af314b17a7bfcb2dbdf6c3","n":262144,"r":8,"p":1},"mac":"011743cb5fa963afaf30e199811e8a05e9a96c10102ac8adf5b1cc1e418e2bdc"},"id":"3be07a3b-01ca-46b6-910a-9d581475459d"}',
    },
  });

  return mockStorage;
}
