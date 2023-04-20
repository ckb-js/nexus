import React, { createContext, useContext } from 'react';
import { FullOwnershipProvider } from '@nexus-wallet/ownership-providers';
import { useAsyncState } from './useAsyncState';
import { detectCkb } from '@nexus-wallet/detect-ckb';
import { Cell } from '@nexus-wallet/protocol';

const context = createContext<FullOwnershipProvider | null>(null);

export function NexusProvider({ children }: React.PropsWithChildren) {
  const { Provider } = context;
  const provider = useAsyncState(async () => {
    const ckb = await detectCkb();
    return new FullOwnershipProvider({ ckb: ckb });
  });

  if (!provider) return null;

  return <Provider value={provider}>{children}</Provider>;
}

export function useProvider() {
  const provider = useContext(context);
  if (!provider) throw new Error('useProvider must be used within a NexusProvider');
  return provider;
}

export function useCells(): Cell[] {
  const provider = useProvider();
  return useAsyncState(
    async () => {
      if (!provider) return [];

      let collected = [];
      for await (const cell of provider.collector()) {
        collected.push(cell);
      }
      return collected;
    },
    [],
    [],
  );
}
