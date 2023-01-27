export type NetworkConfig = {
  name: string;
  url: string;
};

export type NetworkConfigWithStatus = NetworkConfig & {
  enable?: boolean;
};

const networkService = {
  network: [
    {
      name: 'Mainnet',
      url: 'https://mainnet.infura.io/v3/6d7c6f9c9c9d4b8e9e7f6b5a5f4c3b2a',
      enable: true,
    },
    {
      name: 'Ropsten',
      url: 'https://ropsten.infura.io/v3/6d7c6f9c9c9d4b8e9e7f6b5a5f4c3b2a',
    },
  ],
  async getNetwork(): Promise<NetworkConfigWithStatus[]> {
    return this.network;
  },

  async toggleNetwork(): Promise<void> {
    return;
  },

  async addNetwork(network: NetworkConfig): Promise<void> {
    this.network.push(network);
  },
};

export default networkService;
