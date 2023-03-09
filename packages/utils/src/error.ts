import { LIB_VERSION } from './version';
import { formatMessageWithPrefix } from './internal';

export function makeError(...args: unknown[]): Error {
  const formatted = formatMessageWithPrefix('[NexusWallet]:', ...args);
  return new Error(`${formatted}\t(version=${LIB_VERSION})`);
}

export function throwError(...args: unknown[]): never {
  throw makeError(...args);
}

export function unimplemented(): never {
  throwError('Unimplemented');
}
