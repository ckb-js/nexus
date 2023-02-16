import browser from 'webextension-polyfill';
import { MessengerAdapter } from './session';

export const browserExtensionAdapter: MessengerAdapter = {
  send: (message) => browser.runtime.sendMessage(message),
  receive: (handler) => browser.runtime.onMessage.addListener(handler),
  dispose: (receiver) => browser.runtime.onMessage.removeListener(receiver),
};
