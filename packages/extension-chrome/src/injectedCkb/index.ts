import { EventClient, Events, InjectedCkb, RpcClient } from '@nexus-wallet/types';
import { LIB_VERSION } from '@nexus-wallet/utils';
import { RpcMethods } from '../rpc/types';

export function createInjectedCkb<Rpc = RpcMethods, Evt = Events>({
  rpcClient,
  eventClient,
}: {
  rpcClient: RpcClient<Rpc>;
  eventClient: EventClient<Evt>;
}): InjectedCkb<Rpc, Evt> {
  return {
    version: LIB_VERSION,
    request: rpcClient.request.bind(rpcClient),
    on: eventClient.on.bind(eventClient),
    removeListener: eventClient.removeListener.bind(eventClient),
  };
}
