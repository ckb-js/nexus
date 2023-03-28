import { NetworkConfig, Whitelist } from './types';

// TODO: remove it when the real service is ready
class ConfigService {
  networks: NetworkConfig[] = [
    {
      id: '0',
      displayName: 'CKB',
      networkName: 'CKB',
      rpcUrl: 'https://mainnet.infura.io/v3/6d7c6f9c9c9d4b8e9e7f6b5a5f4c3b2a',
    },
    {
      id: '1',
      displayName: 'CKB Testnet',
      networkName: 'ckb_testnet',
      rpcUrl: 'https://localhost:8114',
    },
  ];

  currentNetwork = '1';

  whitelist = [
    {
      url: 'https://google.com',
    },
    {
      url: 'https://baidu.com',
    },
  ];

  getNetworks(): NetworkConfig[] {
    return this.networks;
  }
  addNetwork(network: NetworkConfig): Promise<void> {
    this.networks.push(network);
    return Promise.resolve();
  }

  removeNetwork(network: NetworkConfig): Promise<void> {
    this.networks = this.networks.filter((item) => item.id !== network.id);
    return Promise.resolve();
  }

  getSelectedNetwork(): Promise<string> {
    return Promise.resolve(this.currentNetwork);
  }

  setSelectedNetwork(payload: { id: string }): Promise<void> {
    this.currentNetwork = payload.id;
    return Promise.resolve();
  }

  getWhitelist(): Promise<Whitelist[]> {
    return Promise.resolve(this.whitelist);
  }

  // addWhitelistItem(payload: { url: string }): Promise<void> {
  //   this.whitelist.push(payload.url);
  //   return Promise.resolve();
  // }

  removeWhitelistItem(payload: { url: string }): Promise<void> {
    this.whitelist = this.whitelist.filter((item) => item.url !== payload.url);
    return Promise.resolve();
  }
}

export default new ConfigService();

export type { NetworkConfig };
