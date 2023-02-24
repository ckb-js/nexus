import { createInMemoryStorage } from '../../src/services/storage';

/**
 * a mocked storage with init wallet with
 * <pre>
 * {
 *     nickname: 'Nexus Dev',
 *     mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
 *     password: '123456',
 * }
 * </pre>
 * use it to avoid the need to init wallet in each test
 */
export const mockStorage = createInMemoryStorage();
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
    selectedNetwork: 'mainnet',
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
    wss: '{"version":3,"crypto":{"ciphertext":"b9ed25a10285b0739fc65aaa695a502e960c2278c0d29b7f7cc39230ae628ccf5c3fba4b989e1feb263a8469cf2f4b7aa22fed19a1d11a6673d9bbd83485cb69","cipherparams":{"iv":"2c3d74396d3621d5bd9e9f96b3192bc2"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"961c1e3a6010a20094cc518d8966cfc0a9444cf244205554b304b62425968d96","n":262144,"r":8,"p":1},"mac":"307e9c6949935ed168c6f863a88a7284472972590986e1d347718607186e8f16"},"id":"bd1c4484-415c-4826-ace5-309fae4335a7"}',
  },
});
