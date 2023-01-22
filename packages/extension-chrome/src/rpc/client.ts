import { asserts } from '@nexus-wallet/utils';
import { isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import { sendMessage } from '../messaging';

export const RPCClient = new JSONRPCClient(async (req) => {
  const response = await sendMessage('contentAndInjected', req, 'content-script');
  asserts.asserts(isJSONRPCResponse(response), `Invalid JSON-RPC response: ${response}`);
  RPCClient.receive(response);
});
