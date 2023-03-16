export type { InjectedCkb, CkbProvider } from './injected';
export type {
  OwnershipService,
  NotificationService,
  KeystoreService,
  GrantService,
  ConfigService,
  PlatformService,
} from './services';
export type { Storage } from './storage';
export type { Promisable, Paginate, Cursor } from './base';
export type { AsyncCall, AsyncCallMap, Call, CallMap, CallResult, CallParam } from './call';

export { SIGN_DATA_MAGIC } from '@nexus-wallet/protocol/lib/ownership/fullOwnership';
export type { Nickname } from '@nexus-wallet/protocol/lib/base';
export type { RpcMethods as ProtocolRpcMethods } from '@nexus-wallet/protocol/lib/rpc';
