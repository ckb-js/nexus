import { PlatformService } from '@nexus-wallet/types';

export const MOCK_PLATFORM_URL = 'internal://nexus-wallet.io';
export const MOCK_PLATFORM_PASSWORD = '12345678';

// TODO: move it to @nexus-wallet/testkit
export const mockPlatformService: PlatformService = {
  getActiveSiteInfo: async () => undefined,
  getRequesterAppInfo: async () => ({ url: MOCK_PLATFORM_URL }),
  requestGrant: async () => {},
  requestSignData: async () => ({ password: MOCK_PLATFORM_PASSWORD }),
  requestSignTransaction: async () => ({ password: MOCK_PLATFORM_PASSWORD }),
  navigateToInitWallet: async () => {},
  getFavicon: () => 'https://nexus-wallet.io/favicon.ico',
};
