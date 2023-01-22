import { RPCClient as _RPCClient } from '../rpc/client';

const walletService = {
  async generateRandomMnemonic(): Promise<string[]> {
    return Promise.resolve([
      'finite',
      'omit',
      'doze',
      'dog',
      'pat',
      'team',
      'seek',
      'pink',
      'punch',
      'scale',
      'clap',
      'computer',
    ]);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createNewWallet(mnemonic: string[], password: string): Promise<void> {
    return Promise.resolve();
    // return RPCClient.request('wallet_createNewWallet', null);
  },
};

export default walletService;
