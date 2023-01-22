import { createReducerContext } from 'react-use';

type State = {
  mnemonic: string[];
};

const [useSharedState, SharedStateProvider] = createReducerContext(
  (state: State, action: any): State => {
    switch (action.type) {
      case 'SET_MNEMONIC':
        return { ...state, mnemonic: action.payload };
      default:
        return state;
    }
  },
  {
    mnemonic: [],
  },
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useWalletManagerStore() {
  const [state, dispatch] = useSharedState();

  return {
    ...state,
    setMnemonic: (mnemonic: string[]) => dispatch({ type: 'SET_MNEMONIC', payload: mnemonic }),
  };
}

export { SharedStateProvider };
