import { Network } from '@nexus-wallet/types/lib/injected';
import { Hash, Script } from '@ckb-lumos/base';

export const MAX_ADDRESS_GAP = 20;
export const RULE_BASED_MAX_ADDRESS_GAP = 50;

export type LockInfoStorage = {
  fullOwnership: LocksAndPointer;
  ruleBasedOwnership: LocksAndPointer;
};

export type LockInfo = {
  // hd wallet parent path
  parentPath: string;
  // the BIP44's {@link https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#index index}
  index: number;
  publicKey: string;
  blake160: string;
  network: Network;
  lock: Script;
  lockHash: Hash;
  onchain: boolean;
};

export type NexusLockInfos = {
  onChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
  offChain: {
    external: LockInfo[];
    change: LockInfo[];
  };
};

export type NexusLockPointers = {
  offChain: {
    external: LockInfo | null;
    change: LockInfo | null;
  };
};

export type LocksAndPointer = {
  details: NexusLockInfos;
  pointers: NexusLockPointers;
};
