import { create } from 'zustand';
import { createServicesFactory } from '../../services';

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
    const internalService = createServicesFactory().get('internalService');
    return internalService.initWallet({
      password: get().password,
      nickname: get().username,
      mnemonic: get().seed,
    });
  },
}));
