import { create } from 'zustand';

type State = {
  seed: string[];
  password: string;
  username: string;
};

type Actions = {
  set: (state: Partial<State>) => void;
  reset: () => void;
  createWallet: () => Promise<void>;
};

export const useWalletCreationStore = create<State & Actions>((setState) => ({
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

  createWallet: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  },
}));
