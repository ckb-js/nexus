import { createLogger } from '@nexus-wallet/utils/lib';
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
const logger = createLogger('walletManger/store.ts');
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
    const factory = makeBrowserExtensionModulesFactory();
    const internalService = factory.get('internalService');
    const eventHub = factory.get('eventHub');
    await internalService.initWallet({
      password: get().password,
      nickname: get().username,
      mnemonic: get().seed,
    });
    logger.info('init wallet done.', get().seed);
    eventHub.emit('walletInitialized');
  },
}));
