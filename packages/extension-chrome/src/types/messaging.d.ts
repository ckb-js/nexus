import { ProtocolWithReturn } from 'webext-bridge';

type TabId = number;

declare module 'webext-bridge' {
  interface ProtocolMap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpc: ProtocolWithReturn<any, any>;

    // TODO: create a bounded message helper to handle
    //  communication between background and notification
    [getRequesterAppInfo: `getRequesterAppInfo-${TabId}`]: ProtocolWithReturn<void, { url: string }>;
    [userHasEnabledWallet: `userHasEnabledWallet-${TabId}`]: ProtocolWithReturn<void, void>;
  }
}
