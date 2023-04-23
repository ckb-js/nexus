import type { HexString } from '@ckb-lumos/base';

/**
 * Nexus is a UTxO wallet, unlike accounts based wallets, it often has multiple addresses in a transaction, so we do not
 * use address as the identifier of a wallet. Instead, we use a nickname to identify a wallet(end-user).
 */
export type Nickname = string;

/**
 * A cursor is an encoded string that represents a position in a list of objects. Nexus uses cursor pagination to
 * paginate through lists of objects, e.g. scripts, cells
 */
export type Cursor = string;

/**
 * A paginated list of objects.
 *
 * @typeParam T - The type of the objects in the list.
 */
export type Paginate<T> = {
  cursor: Cursor;
  objects: T[];
};

export type Signature = HexString;

export type { HexString, Transaction, Script, Cell } from '@ckb-lumos/base';
export type OutputValidator = 'passthrough' | 'well_known_scripts_only';
