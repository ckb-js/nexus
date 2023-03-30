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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

if (shouldInjectProvider()) {
  injectScript();
}

function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
