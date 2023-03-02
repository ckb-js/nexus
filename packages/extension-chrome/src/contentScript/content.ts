import { isJSONRPCRequest, isJSONRPCResponse, JSONRPCClient } from 'json-rpc-2.0';
import * as bridgeMessenger from 'webext-bridge';
import * as windowMessenger from '../messaging';
import { errors } from '@nexus-wallet/utils';

function injectScript(): void {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

const client = new JSONRPCClient(async (req) => {
  // content script -> background service worker
  const response = await bridgeMessenger.sendMessage('rpc', req, 'background');
  if (!isJSONRPCResponse(response)) {
    errors.throwError(`Invalid JSON-RPC response: ${response}`);
  }
  client.receive(response);
});

// background service worker -> content script
bridgeMessenger.onMessage('event', ({ data }) => {
  // content script -> injected script
  void windowMessenger.sendMessage('event', data, 'website');
});

windowMessenger.onMessage('contentAndInjected', (req) => {
  if (!isJSONRPCRequest(req)) {
    errors.throwError(`Invalid JSON-RPC request: ${JSON.stringify(req)}`);
  }
  return client.requestAdvanced(req);
});

if (document.doctype?.name === 'html') {
  injectScript();
}
