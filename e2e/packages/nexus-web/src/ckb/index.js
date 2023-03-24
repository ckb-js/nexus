import React from 'react';
import { CkbOwnershipService } from './ckbOwnershipService';
import { InjectedCkbService } from './injectedCkbService';

class RootStore {
  constructor() {
    this.fullOwnership = new CkbOwnershipService();
    this.ruleBasedOwnership = new CkbOwnershipService();
    this.injectedCkbService = new InjectedCkbService();
  }
}

const rootStore = new RootStore();

const context = React.createContext(rootStore);

export const useStore = () => React.useContext(context);
