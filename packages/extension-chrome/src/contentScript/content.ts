import { sendMessage } from 'webext-bridge';
import { isJSONRPCRequest, isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import { onMessage } from '../messaging';
import { errors } from '@nexus-wallet/utils';

function injectScript(): void {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

const client = new JSONRPCClient(async (req) => {
  const response = await sendMessage('rpc', req, 'background');
  if (!isJSONRPCResponse(response)) {
    errors.throwError(`Invalid JSON-RPC response: ${response}`);
  }
  client.receive(response);
});

onMessage('contentAndInjected', (req) => {
  if (!isJSONRPCRequest(req)) {
    errors.throwError(`Invalid JSON-RPC request: ${JSON.stringify(req)}`);
  }
  return client.requestAdvanced(req);
});

if (document.doctype?.name === 'html') {
  injectScript();
}
