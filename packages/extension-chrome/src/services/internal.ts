import { ConfigService, KeystoreService } from '@nexus-wallet/types';
import { NetworkConfig } from '@nexus-wallet/types/lib/services';
import type { Browser } from 'webextension-polyfill';

// full ownership with external chain
export const FULL_OWNERSHIP_EXTERNAL_PARENT_PATH = `m/44'/309'/0'/0`;
// full ownership with internal chain
export const FULL_OWNERSHIP_INTERNAL_PARENT_PATH = `m/44'/309'/0'/1`;
// rule-based ownership
// 4410179 === 0x434b42 + 1  => (CKB) in hex
// m / ckb_purpose 1'/ 0' / index
export const RULE_BASED_PARENT_PATH = `m/4410179'/0'`;

const DEFAULT_NETWORKS: NetworkConfig[] = [
  { id: 'mainnet', networkName: 'ckb', displayName: 'Mainnet', rpcUrl: 'https://mainnet.ckb.dev' },
  { id: 'testnet', networkName: 'ckb_testnet', displayName: 'Testnet', rpcUrl: 'https://testnet.ckb.dev' },
];

export interface InternalService {
  initWallet: (payload: { password: string; nickname: string; mnemonic: string | string[] }) => Promise<void>;
  startInitIfNotInitialized: () => Promise<void>;
  isInitialized: () => Promise<boolean>;
}

export function createInternalService(payload: {
  keystoreService: KeystoreService;
  configService: ConfigService;
  browser: Browser;
}): InternalService {
  const { keystoreService, configService } = payload;

  const impl: InternalService = {
    initWallet: async (payload) => {
      const mnemonic = Array.isArray(payload.mnemonic) ? payload.mnemonic.join(' ') : payload.mnemonic;
      await configService.setConfig({
        config: {
          nickname: payload.nickname,
          whitelist: [],
          selectedNetwork: 'mainnet',
          networks: DEFAULT_NETWORKS,
        },
      });
      await keystoreService.initKeystore({
        password: payload.password,
        mnemonic,
        paths: [FULL_OWNERSHIP_EXTERNAL_PARENT_PATH, FULL_OWNERSHIP_INTERNAL_PARENT_PATH, RULE_BASED_PARENT_PATH],
      });
    },

    isInitialized: () => Promise.resolve(keystoreService.hasInitialized()),
    startInitIfNotInitialized: /* istanbul ignore next */ async () => {
      const initialized = await impl.isInitialized();
      if (initialized) return;
      await payload.browser.tabs.create({ url: `walletManager.html` });
    },
  };

  return impl;
}
