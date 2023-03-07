import { create } from 'zustand';
import { makeBrowserExtensionModulesFactory } from '../../services';

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

  initWallet: async () => {
    // TODO - this is a temporary solution, we should use only one factory for all modules
    const factory = makeBrowserExtensionModulesFactory();
    const internalService = factory.get('internalService');
    await internalService.initWallet({
      password: get().password,
      nickname: get().username,
      mnemonic: get().seed,
    });
  },
}));
