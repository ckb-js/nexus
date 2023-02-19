import { Hash, Script } from '@ckb-lumos/base';

export const MAX_ADDRESS_GAP = 20;
export const RULE_BASED_MAX_ADDRESS_GAP = 50;

// basic lock info type
export type LockInfo = {
  // hd wallet parent path
  parentPath: string;
  // the BIP44's {@link https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#index index}
  index: number;
  publicKey: string;
  blake160: string;
  lock: Script;
  lockHash: Hash;
  onchain: boolean;
};

// rule based ownership types
export type RuleBasedLockInfos = LockInfo[];

export type RuleBasedPointer = LockInfo | null;

export type RuleBasedLocksAndPointer = {
  lockInfos: RuleBasedLockInfos;
  pointer: RuleBasedPointer;
};

// full ownership types
export type FullLockInfos = {
  external: LockInfo[];
  change: LockInfo[];
};

export type FullPointers = {
  external: LockInfo | null;
  change: LockInfo | null;
};

export type FullLocksAndPointer = {
  lockInfos: FullLockInfos;
  pointers: FullPointers;
};

// storage schema
export type LockInfoStorage = {
  full: FullLocksAndPointer;
  ruleBased: RuleBasedLocksAndPointer;
};
