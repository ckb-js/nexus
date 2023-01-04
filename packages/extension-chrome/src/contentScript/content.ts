import { sendMessage } from 'webext-bridge';
import { listenOnContent } from '../messaging';
import { JSONRPCClient, JSONRPCRequest, JSONRPCResponse } from 'json-rpc-2.0';

function injectScript(): void {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

const client = new JSONRPCClient(async (req) => {
  const response = await sendMessage('rpc', req, 'background');
  client.receive(response as unknown as JSONRPCResponse);
});

listenOnContent((req) => Promise.resolve(client.requestAdvanced(req as JSONRPCRequest)));

if (document.doctype?.name === 'html') {
  injectScript();
}
