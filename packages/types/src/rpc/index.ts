export type { Script, Cell, Transaction } from '@ckb-lumos/lumos';

export { SIGN_DATA_MAGIC } from '@nexus-wallet/protocol/lib/ownership/fullOwnership';

export type { Wallet } from '@nexus-wallet/protocol/lib/wallet';
export type { FullOwnership } from '@nexus-wallet/protocol/lib/ownership/fullOwnership';
export type { Cursor, HexString, Paginate, Signature } from '@nexus-wallet/protocol/lib/base';
export type {
  GroupedSignature,
  GetOffChainLocksPayload,
  GetOnChainLocksPayload,
  GetLiveCellsPayload,
  SignDataPayload,
  SignTransactionPayload,
} from '@nexus-wallet/protocol/lib/ownership/fullOwnership';
