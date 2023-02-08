import { create } from 'zustand';

type State = {
  seed: string[];
  password: string;
  userName: string;

  /**
   * If it is true, the next step can be access via clicking Next button.
   */
  dischargeNext: boolean;
};

type Actions = {
  set: (state: Partial<State>) => void;
  createWallet: () => Promise<void>;
};

export const useWalletCreationStore = create<State & Actions>((setState) => ({
  seed: [],
  password: '',
  userName: '',
  dischargeNext: false,
  set: (state) => {
    setState(state);
  },

  createWallet: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  },
}));
