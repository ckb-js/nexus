import { create } from 'zustand';
import { internalService } from '../../mockServices/internal';

type State = {
  seed: string[];
  password: string;
  username: string;
};

type Actions = {
  set: (state: Partial<State>) => void;
  reset: () => void;
  initWallet: () => Promise<void>;
};

export const useWalletCreationStore = create<State & Actions>((setState, get) => ({
  seed: [],
  password: '',
  username: '',
  set: (state) => {
    setState(state);
  },
  reset: () => {
    setState({
      seed: [],
      password: '',
      username: '',
    });
  },

  initWallet: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        internalService.initWallet({ password: get().password, nickname: get().username, mnemonic: get().seed });
        resolve();
      }, 2000);
    });
  },
}));
