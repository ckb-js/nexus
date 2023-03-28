import React from 'react';
import { InjectedCkbService } from './injectedCkbService';

class RootStore {
  constructor() {
    this.injectedCkbService = new InjectedCkbService();
  }
}

const rootStore = new RootStore();

const context = React.createContext(rootStore);

export const useStore = () => React.useContext(context);
