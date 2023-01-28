import { InjectedCkb } from '@nexus-wallet/types';

declare global {
  interface Window {
    ckb: InjectedCkb;
  }
}
