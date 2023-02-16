interface InternalService {
  initWallet: (payload: { password: string; nickname: string; mnemonic: string | string[] }) => Promise<void>;
}

export const internalService: InternalService = {
  async initWallet({ password, mnemonic, nickname }) {
    console.log(password, mnemonic, nickname);
  },
};
