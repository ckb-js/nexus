import { create } from 'zustand';
import { createServicesFactory } from '../../services';
import { createWatchtower } from '../../services/ownership';
import { OwnershipStorage, createScriptInfoDb } from '../../services/ownership/storage';

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
    const factory = createServicesFactory();
    const internalService = factory.get('internalService');
    return internalService
      .initWallet({
        password: get().password,
        nickname: get().username,
        mnemonic: get().seed,
      })
      .then(async () => {
        const configService = factory.get('configService');
        const keystoreService = factory.get('keystoreService');
        const backendProvider = factory.get('backendProvider');
        const storage = factory.get('storage') as OwnershipStorage;
        const selectedNetwork = await configService.getSelectedNetwork();
        const db = createScriptInfoDb({ storage, networkId: selectedNetwork.id });
        const watchtower = createWatchtower({ db, keystoreService, backend: await backendProvider.resolve() });
        watchtower.run();
      });
  },
}));
