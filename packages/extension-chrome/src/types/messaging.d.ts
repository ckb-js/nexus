// eslint-disable-next-line import/no-unresolved
import { ProtocolWithReturn } from 'webext-bridge';

type TabId = number;

declare module 'webext-bridge' {
  interface ProtocolMap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpc: ProtocolWithReturn<any, any>;
  }
}
