import { onMessage } from 'webext-bridge';
import { JSONRPCRequest, JSONRPCServer } from 'json-rpc-2.0';
import { CkbProvider } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';

// FIXME: https://developer.chrome.com/docs/extensions/reference/action/#method-getPopup
// declare module 'chrome' {
//   namespace chrome.action {
//     function openPopup(options?: unknown, callback?: () => void): void;
//   }
// }

const server = new JSONRPCServer();

server.addMethod('wallet_enable', async () => {
  // TODO
  return;
});

type PayloadOf<Method extends keyof CkbProvider['fullOwnership']> = Parameters<CkbProvider['fullOwnership'][Method]>;
type ReturnOf<Method extends keyof CkbProvider['fullOwnership']> = ReturnType<CkbProvider['fullOwnership'][Method]>;

server.addMethod(
  'wallet_fullOwnership_getLiveCells',
  async (_params: PayloadOf<'getLiveCells'>): ReturnOf<'getLiveCells'> => {
    // TODO
    return {
      cursor: '',
      objects: [],
    };
  },
);

server.addMethod(
  'wallet_fullOwnership_getUnusedLocks',
  async (_params: PayloadOf<'getUnusedLocks'>): ReturnOf<'getUnusedLocks'> => {
    // TODO
    errors.unimplemented();
  },
);

onMessage('rpc', async ({ data }) => server.receive(data as unknown as JSONRPCRequest));
