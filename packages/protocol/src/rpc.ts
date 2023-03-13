import { FullOwnership } from './ownership/fullOwnership';
import { Wallet } from './wallet';

export interface RpcMethods extends FullOwnership, Wallet {}
